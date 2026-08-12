import { Request, Response, NextFunction } from 'express'
import prisma from '../config/db'
import { z } from 'zod'
import { MovementType } from '@prisma/client'

const stockAdjustmentSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  reason: z.string().min(1),
})

export const getStockMovements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { product_id, type, page = 1, limit = 10 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {}
    if (product_id) where.product_id = product_id
    if (type) where.movement_type = type

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: {
          product: { select: { product_name: true, sku: true } },
          created_by: { select: { name: true } }
        }
      }),
      prisma.stockMovement.count({ where })
    ])

    res.status(200).json({ success: true, data: movements, meta: { total, page: Number(page), limit: Number(limit) } })
  } catch (error) {
    next(error)
  }
}

export const stockIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { product_id, quantity, reason } = stockAdjustmentSchema.parse(req.body)

    const product = await prisma.product.findUnique({ where: { id: product_id } })
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' })
      return
    }

    // Atomic transaction for updating stock and creating movement
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: product_id },
        data: { current_stock: { increment: quantity } }
      })

      await tx.stockMovement.create({
        data: {
          product_id,
          quantity_changed: quantity,
          movement_type: MovementType.IN,
          reason,
          created_by_id: req.user!.id
        }
      })
    })

    res.status(200).json({ success: true, message: 'Stock IN successful' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues })
      return
    }
    next(error)
  }
}

export const stockOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { product_id, quantity, reason } = stockAdjustmentSchema.parse(req.body)

    // Using transaction to prevent race conditions during OUT
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: product_id } })
      if (!product) {
        throw new Error('Product not found')
      }

      if (product.current_stock < quantity) {
        throw new Error('Insufficient stock')
      }

      await tx.product.update({
        where: { id: product_id },
        data: { current_stock: { decrement: quantity } }
      })

      await tx.stockMovement.create({
        data: {
          product_id,
          quantity_changed: quantity,
          movement_type: MovementType.OUT,
          reason,
          created_by_id: req.user!.id
        }
      })
    })

    res.status(200).json({ success: true, message: 'Stock OUT successful' })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues })
      return
    }
    if (error.message === 'Product not found') {
      res.status(404).json({ success: false, message: error.message })
      return
    }
    if (error.message === 'Insufficient stock') {
      res.status(400).json({ success: false, message: error.message })
      return
    }
    next(error)
  }
}
