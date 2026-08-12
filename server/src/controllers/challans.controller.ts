import { Request, Response, NextFunction } from 'express'
import prisma from '../config/db'
import { z } from 'zod'
import { ChallanStatus, MovementType } from '@prisma/client'

const challanItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
})

const createChallanSchema = z.object({
  customer_id: z.string().uuid(),
  items: z.array(challanItemSchema).min(1),
})

const generateChallanNumber = async () => {
  const count = await prisma.challan.count()
  const year = new Date().getFullYear()
  return `CH-${year}-${String(count + 1).padStart(6, '0')}`
}

export const getChallans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {}
    if (status) where.status = status

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          customer: { select: { customer_name: true } },
          created_by: { select: { name: true } }
        }
      }),
      prisma.challan.count({ where })
    ])

    res.status(200).json({ success: true, data: challans, meta: { total, page: Number(page), limit: Number(limit) } })
  } catch (error) {
    next(error)
  }
}

export const getChallanById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        created_by: { select: { name: true } }
      }
    })

    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' })
      return
    }

    res.status(200).json({ success: true, data: challan })
  } catch (error) {
    next(error)
  }
}

export const createChallan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customer_id, items } = createChallanSchema.parse(req.body)

    // Fetch products to take snapshots
    const productIds = items.map(item => item.product_id)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    if (products.length !== productIds.length) {
      res.status(400).json({ success: false, message: 'One or more products are invalid' })
      return
    }

    const productsMap = new Map(products.map(p => [p.id, p]))

    let totalQuantity = 0
    let totalAmount = 0
    const challanItemsData = items.map(item => {
      const product = productsMap.get(item.product_id)!
      const total_price = product.unit_price * item.quantity

      totalQuantity += item.quantity
      totalAmount += total_price

      return {
        product_id: product.id,
        product_name_snapshot: product.product_name,
        sku_snapshot: product.sku,
        unit_price_snapshot: product.unit_price,
        quantity: item.quantity,
        total_price
      }
    })

    const challan_number = await generateChallanNumber()

    const challan = await prisma.challan.create({
      data: {
        challan_number,
        customer_id,
        total_quantity: totalQuantity,
        total_amount: totalAmount,
        status: ChallanStatus.DRAFT,
        created_by_id: req.user!.id,
        items: {
          create: challanItemsData
        }
      },
      include: { items: true }
    })

    res.status(201).json({ success: true, data: challan })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues })
      return
    }
    next(error)
  }
}

export const confirmChallan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true }
      })

      if (!challan) throw new Error('Challan not found')
      if (challan.status !== ChallanStatus.DRAFT) throw new Error('Only DRAFT challans can be confirmed')

      // 1. Check stock for all items
      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.product_id } })
        if (!product) throw new Error(`Product ${item.product_name_snapshot} not found`)
        if (product.current_stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.product_name}`)
        }
      }

      // 2. Reduce stock & create movements
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.product_id },
          data: { current_stock: { decrement: item.quantity } }
        })

        await tx.stockMovement.create({
          data: {
            product_id: item.product_id,
            quantity_changed: item.quantity,
            movement_type: MovementType.OUT,
            reason: `Challan ${challan.challan_number} confirmed`,
            reference_type: 'CHALLAN',
            created_by_id: req.user!.id
          }
        })
      }

      // 3. Mark CONFIRMED
      await tx.challan.update({
        where: { id },
        data: { status: ChallanStatus.CONFIRMED }
      })
    })

    res.status(200).json({ success: true, message: 'Challan confirmed successfully' })
  } catch (error: any) {
    if (error.message === 'Challan not found') {
      res.status(404).json({ success: false, message: error.message })
      return
    }
    if (error.message === 'Only DRAFT challans can be confirmed' || error.message.startsWith('Insufficient stock') || error.message.startsWith('Product')) {
      res.status(400).json({ success: false, message: error.message })
      return
    }
    next(error)
  }
}

export const cancelChallan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true }
      })

      if (!challan) throw new Error('Challan not found')
      if (challan.status === ChallanStatus.CANCELLED) throw new Error('Challan is already cancelled')

      if (challan.status === ChallanStatus.CONFIRMED) {
        // Restore stock
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.product_id },
            data: { current_stock: { increment: item.quantity } }
          })

          await tx.stockMovement.create({
            data: {
              product_id: item.product_id,
              quantity_changed: item.quantity,
              movement_type: MovementType.IN,
              reason: `Challan ${challan.challan_number} cancelled`,
              reference_type: 'CHALLAN',
              created_by_id: req.user!.id
            }
          })
        }
      }

      await tx.challan.update({
        where: { id },
        data: { status: ChallanStatus.CANCELLED }
      })
    })

    res.status(200).json({ success: true, message: 'Challan cancelled successfully' })
  } catch (error: any) {
    if (error.message === 'Challan not found') {
      res.status(404).json({ success: false, message: error.message })
      return
    }
    if (error.message === 'Challan is already cancelled') {
      res.status(400).json({ success: false, message: error.message })
      return
    }
    next(error)
  }
}
