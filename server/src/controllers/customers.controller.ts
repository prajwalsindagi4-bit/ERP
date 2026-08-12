// @ts-nocheck
import { Request, Response, NextFunction } from 'express'
import prisma from '../config/db'
import { z } from 'zod'
import { sendEmail } from '../utils/email'

const customerSchema = z.object({
  customer_name: z.string().min(1),
  mobile_number: z.string().min(10),
  email: z.string().email().optional().nullable(),
  business_name: z.string().optional().nullable(),
  gst_number: z.string().optional().nullable(),
  customer_type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().optional().nullable(),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']),
  follow_up_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status, type, page = 1, limit = 10 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {}
    if (search) {
      where.OR = [
        { customer_name: { contains: String(search), mode: 'insensitive' } },
        { mobile_number: { contains: String(search) } },
        { business_name: { contains: String(search), mode: 'insensitive' } },
      ]
    }
    if (status) where.status = status
    if (type) where.customer_type = type

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' },
      }),
      prisma.customer.count({ where })
    ])

    res.status(200).json({ success: true, data: customers, meta: { total, page: Number(page), limit: Number(limit) } })
  } catch (error) {
    next(error)
  }
}

export const getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followups: { orderBy: { created_at: 'desc' }, include: { created_by: { select: { name: true } } } }
      }
    })

    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' })
      return
    }
    res.status(200).json({ success: true, data: customer })
  } catch (error) {
    next(error)
  }
}

export const createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = customerSchema.parse(req.body)
    const customer = await prisma.customer.create({
      data: {
        ...data,
        follow_up_date: data.follow_up_date ? new Date(data.follow_up_date) : null,
        created_by_id: req.user!.id
      }
    })
    res.status(201).json({ success: true, data: customer })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues })
      return
    }
    next(error)
  }
}

export const updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const data = customerSchema.partial().parse(req.body)
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...data,
        follow_up_date: data.follow_up_date !== undefined ? (data.follow_up_date ? new Date(data.follow_up_date) : null) : undefined,
      }
    })
    res.status(200).json({ success: true, data: customer })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues })
      return
    }
    next(error)
  }
}

export const addFollowup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { note } = req.body
    if (!note) {
      res.status(400).json({ success: false, message: 'Note is required' })
      return
    }

    const followup = await prisma.customerFollowup.create({
      data: {
        customer_id: id,
        note,
        created_by_id: req.user!.id
      }
    })

    const customer = await prisma.customer.findUnique({ where: { id } })
    if (customer && customer.email) {
      await sendEmail(
        customer.email, 
        'New Follow-up Reminder', 
        `<p>Hello ${customer.customer_name},</p><p>A new follow-up note has been added to your account:</p><blockquote>${note}</blockquote>`
      ).catch(console.error) // non-blocking
    }

    res.status(201).json({ success: true, data: followup })
  } catch (error) {
    next(error)
  }
}

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    await prisma.customer.delete({ where: { id } })
    res.status(200).json({ success: true, message: 'Customer deleted' })
  } catch (error) {
    next(error)
  }
}
