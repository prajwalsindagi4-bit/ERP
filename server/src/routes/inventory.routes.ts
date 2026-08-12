import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import { getStockMovements, stockIn, stockOut } from '../controllers/inventory.controller'

const router = Router()
router.use(authenticate)

// Note: In app.ts this will be mounted at /api
// so we'll mount router.use('/api', inventoryRoutes) or separate them.

router.get('/stock-movements', authorize(['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS']), getStockMovements)
router.post('/stock/in', authorize(['ADMIN', 'WAREHOUSE']), stockIn)
router.post('/stock/out', authorize(['ADMIN', 'WAREHOUSE']), stockOut)

export default router
