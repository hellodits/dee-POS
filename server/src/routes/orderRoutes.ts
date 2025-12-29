import { Router } from 'express'
import {
  createOrderHandler,
  getOrders,
  getOrder,
  trackOrder,
  updateStatus,
  payOrder,
  voidOrderHandler,
  getKitchenOrders
} from '../controllers/orderController'
import { protect, authorize } from '../middleware/auth'

const router = Router()

// Public routes (Customer App)
router.post('/', createOrderHandler) // Can be used by both POS and WEB
router.get('/track/:orderNumber', trackOrder)

// Protected routes (POS)
router.get('/', protect, getOrders)
router.get('/kitchen', protect, getKitchenOrders)
router.get('/:id', protect, getOrder)
router.patch('/:id/status', protect, updateStatus)
router.post('/:id/pay', protect, payOrder)
router.post('/:id/void', protect, authorize('admin', 'manager'), voidOrderHandler)

export default router
