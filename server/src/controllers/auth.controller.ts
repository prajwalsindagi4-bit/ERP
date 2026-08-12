import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import prisma from '../config/db'
import { generateToken } from '../utils/jwt'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  selectedRole: z.string().optional()
})

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, selectedRole } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' })
      return
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' })
      return
    }

    if (selectedRole && user.role !== selectedRole) {
      res.status(403).json({ success: false, message: `Unauthorized: You do not have permission to access the ${selectedRole} portal.` })
      return
    }

    const token = generateToken({ id: user.id, role: user.role })

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues })
      return
    }
    next(error)
  }
}

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    res.status(200).json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}
