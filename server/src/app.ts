import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

dotenv.config()

const app = express()

// Middleware
app.use(helmet()) // Security headers
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Rate Limiting Config
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 login attempts per windowMs
  message: { success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply global rate limiter to all routes
app.use(globalLimiter)

import authRoutes from './routes/auth.routes'
import customerRoutes from './routes/customers.routes'
import productRoutes from './routes/products.routes'
import inventoryRoutes from './routes/inventory.routes'
import challansRoutes from './routes/challans.routes'
import dashboardRoutes from './routes/dashboard.routes'

// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/products', productRoutes)
app.use('/api', inventoryRoutes)
app.use('/api/challans', challansRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' })
})

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
})

export default app
