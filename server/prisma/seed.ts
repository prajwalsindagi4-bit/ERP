import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config() // Ensure .env is loaded for seed script

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: true })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding...')

  // Clean up
  await prisma.challanItem.deleteMany()
  await prisma.challan.deleteMany()
  await prisma.stockMovement.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customerFollowup.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.create({
    data: { name: 'Admin', email: 'admin@example.com', password_hash: passwordHash, role: Role.ADMIN }
  })
  const sales = await prisma.user.create({
    data: { name: 'Sales', email: 'sales@example.com', password_hash: passwordHash, role: Role.SALES }
  })
  const warehouse = await prisma.user.create({
    data: { name: 'Warehouse', email: 'warehouse@example.com', password_hash: passwordHash, role: Role.WAREHOUSE }
  })
  const accounts = await prisma.user.create({
    data: { name: 'Accounts', email: 'accounts@example.com', password_hash: passwordHash, role: Role.ACCOUNTS }
  })

  // 2. Create Customers
  const customersData = []
  for (let i = 1; i <= 10; i++) {
    customersData.push({
      customer_name: `Customer ${i}`,
      mobile_number: `987654321${i}`,
      email: `customer${i}@example.com`,
      customer_type: i % 2 === 0 ? CustomerType.WHOLESALE : CustomerType.RETAIL,
      status: CustomerStatus.ACTIVE,
      created_by_id: sales.id
    })
  }
  await prisma.customer.createMany({ data: customersData })
  const customers = await prisma.customer.findMany()

  // 3. Create Products
  const productsData = []
  for (let i = 1; i <= 15; i++) {
    productsData.push({
      product_name: `Product ${i}`,
      sku: `PROD-00${i}`,
      category: i < 5 ? 'Electronics' : 'Accessories',
      unit_price: 100 * i,
      current_stock: i * 10,
      minimum_stock_quantity: 5,
      warehouse_location: 'A1'
    })
  }
  await prisma.product.createMany({ data: productsData })
  const products = await prisma.product.findMany()

  // 4. Create Stock Movements
  for (const product of products) {
    await prisma.stockMovement.create({
      data: {
        product_id: product.id,
        quantity_changed: product.current_stock,
        movement_type: MovementType.IN,
        reason: 'Initial stock',
        created_by_id: warehouse.id
      }
    })
  }

  // 5. Create Challans
  const draftChallan = await prisma.challan.create({
    data: {
      challan_number: 'CH-2026-000001',
      customer_id: customers[0].id,
      total_quantity: 2,
      total_amount: products[0].unit_price * 2,
      status: ChallanStatus.DRAFT,
      created_by_id: sales.id,
      items: {
        create: [
          {
            product_id: products[0].id,
            product_name_snapshot: products[0].product_name,
            sku_snapshot: products[0].sku,
            unit_price_snapshot: products[0].unit_price,
            quantity: 2,
            total_price: products[0].unit_price * 2
          }
        ]
      }
    }
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
