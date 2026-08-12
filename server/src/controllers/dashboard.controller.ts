import { Request, Response, NextFunction } from 'express'
import prisma from '../config/db'
import { ChallanStatus } from '@prisma/client'

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalCustomers,
      totalProducts,
      totalChallans,
      confirmedChallans,
      lowStockProducts,
      pendingFollowups,
      recentChallans,
      upcomingFollowups
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.challan.count(),
      prisma.challan.count({ where: { status: ChallanStatus.CONFIRMED } }),
      
      // Low stock products count using raw query since we need to compare two columns
      prisma.$queryRaw<any[]>`SELECT COUNT(*) as count FROM "Product" WHERE current_stock <= minimum_stock_quantity`.then(res => Number(res[0].count)),
      
      prisma.customer.count({
        where: { follow_up_date: { not: null, gte: new Date() } }
      }),
      
      prisma.challan.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: { customer: { select: { customer_name: true } } }
      }),

      prisma.customer.findMany({
        where: { follow_up_date: { not: null, gte: new Date() } },
        take: 5,
        orderBy: { follow_up_date: 'asc' },
        select: { id: true, customer_name: true, follow_up_date: true }
      })
    ])

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCustomers,
          totalProducts,
          totalChallans,
          confirmedChallans,
          lowStockProducts,
          pendingFollowups
        },
        recentChallans,
        upcomingFollowups
      }
    })
  } catch (error) {
    next(error)
  }
}
