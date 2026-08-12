import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: true })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.$executeRawUnsafe(`DELETE FROM "User" WHERE role = 'CUSTOMER';`)
  console.log('Deleted CUSTOMER users')
}

main().finally(() => prisma.$disconnect())
