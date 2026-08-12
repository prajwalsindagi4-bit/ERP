import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/products.controller'

const router = Router()

router.use(authenticate)

router.get('/', authorize(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getProducts)
router.post('/', authorize(['ADMIN']), createProduct)
router.get('/:id', authorize(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getProductById)
router.put('/:id', authorize(['ADMIN']), updateProduct)
router.delete('/:id', authorize(['ADMIN']), deleteProduct)

export default router
