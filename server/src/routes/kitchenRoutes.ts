import { Router } from 'express'
import {
  getKitchenOrders,
  updateKitchenOrderStatus,
  getKitchenStats,
  bumpOrder
} from '../controllers/kitchenController'
import { protect } from '../middleware/auth'

const router = Router()

// All kitchen routes require authentication
router.use(protect)

// Kitchen Display System endpoints
router.get('/orders', getKitchenOrders)
router.get('/stats', getKitchenStats)
router.patch('/orders/:id/status', updateKitchenOrderStatus)
router.post('/orders/:id/bump', bumpOrder)

export default router
