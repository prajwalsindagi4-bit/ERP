import prisma from './src/config/db'
import { Role, CustomerType, CustomerStatus } from '@prisma/client'
import bcrypt from 'bcrypt'

async function main() {
  console.log('Seeding customer user...')

  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@example.com' } })
  if (!adminUser) throw new Error('Admin user not found for creation relation')

  // Create a customer
  const customer = await prisma.customer.create({
    data: {
      customer_name: 'Test Retailer',
      business_name: 'Retailer Inc.',
      mobile_number: '1234567890',
      email: 'retailer@example.com',
      customer_type: CustomerType.RETAIL,
      status: CustomerStatus.ACTIVE,
      created_by_id: adminUser.id
    }
  })

  // Create a user for this customer
  const password_hash = await bcrypt.hash('retailer123', 10)
  const user = await prisma.user.create({
    data: {
      name: 'Test Retailer User',
      email: 'retailer@example.com',
      password_hash,
      role: Role.CUSTOMER,
      customer_id: customer.id
    }
  })

  console.log('Created customer and user:', user.email)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
