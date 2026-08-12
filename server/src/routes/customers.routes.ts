import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, addFollowup } from '../controllers/customers.controller'

const router = Router()

// All routes require authentication
router.use(authenticate)

router.get('/', authorize(['ADMIN', 'SALES', 'ACCOUNTS']), getCustomers)
router.post('/', authorize(['ADMIN', 'SALES']), createCustomer)
router.get('/:id', authorize(['ADMIN', 'SALES', 'ACCOUNTS']), getCustomerById)
router.put('/:id', authorize(['ADMIN', 'SALES']), updateCustomer)
router.delete('/:id', authorize(['ADMIN']), deleteCustomer)

router.post('/:id/followups', authorize(['ADMIN', 'SALES']), addFollowup)

export default router
