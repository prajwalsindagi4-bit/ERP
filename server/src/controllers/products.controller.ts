import { Request, Response, NextFunction } from 'express'
import prisma from '../config/db'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const productSchema = z.object({
  product_name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  unit_price: z.number().positive(),
  minimum_stock_quantity: z.number().min(0),
  warehouse_location: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
})

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, category, low_stock, page = 1, limit = 10 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {}
    if (search) {
      where.OR = [
        { product_name: { contains: String(search), mode: 'insensitive' } },
        { sku: { contains: String(search), mode: 'insensitive' } },
      ]
    }
    if (category) where.category = category
    if (low_stock === 'true') {
      where.current_stock = { lte: prisma.product.fields.minimum_stock_quantity } // this requires native query or tricky prisma filter.
      // In prisma, column vs column comparison in findMany where clause is tricky without raw query.
      // So let's fetch based on raw query or evaluate post-fetch if it's not possible easily. Wait, Prisma doesn't support comparing two columns directly in where object without raw queries, except using `expr` in latest versions or just fetching all and filtering. Let's use a workaround: we can't do column to column easily in where object.
      // For now we will handle it with a raw query if low_stock is true.
    }

    let products = []
    let total = 0

    if (low_stock === 'true') {
      // Custom query for low stock using raw
      const rawProducts = await prisma.$queryRaw<any[]>`
        SELECT * FROM "Product" 
        WHERE current_stock <= minimum_stock_quantity
        ORDER BY created_at DESC
        LIMIT ${Number(limit)} OFFSET ${skip}
      `
      const rawTotal: any = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "Product" 
        WHERE current_stock <= minimum_stock_quantity
      `
      products = rawProducts
      total = Number(rawTotal[0].count)
    } else {
      [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { created_at: 'desc' },
        }),
        prisma.product.count({ where })
      ])
    }

    res.status(200).json({ success: true, data: products, meta: { total, page: Number(page), limit: Number(limit) } })
  } catch (error) {
    next(error)
  }
}

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' })
      return
    }
    res.status(200).json({ success: true, data: product })
  } catch (error) {
    next(error)
  }
}

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = productSchema.parse(req.body)
    
    // Check if sku exists
    const existing = await prisma.product.findUnique({ where: { sku: data.sku } })
    if (existing) {
      res.status(409).json({ success: false, message: 'SKU already exists' })
      return
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        current_stock: 0 // New products start with 0 stock, updated via stock movements
      }
    })
    res.status(201).json({ success: true, data: product })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues })
      return
    }
    next(error)
  }
}

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const data = productSchema.partial().parse(req.body)

    if (data.sku) {
      const existing = await prisma.product.findFirst({ where: { sku: data.sku, id: { not: id } } })
      if (existing) {
        res.status(409).json({ success: false, message: 'SKU already exists' })
        return
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data
    })
    res.status(200).json({ success: true, data: product })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues })
      return
    }
    next(error)
  }
}

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    await prisma.product.delete({ where: { id } })
    res.status(200).json({ success: true, message: 'Product deleted' })
  } catch (error) {
    next(error)
  }
}
