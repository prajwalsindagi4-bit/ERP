import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import { getChallans, getChallanById, createChallan, confirmChallan, cancelChallan } from '../controllers/challans.controller'

const router = Router()
router.use(authenticate)

router.get('/', authorize(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getChallans)
router.post('/', authorize(['ADMIN', 'SALES']), createChallan)
router.get('/:id', authorize(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getChallanById)

router.patch('/:id/confirm', authorize(['ADMIN', 'SALES']), confirmChallan)
router.patch('/:id/cancel', authorize(['ADMIN', 'SALES']), cancelChallan)

export default router
