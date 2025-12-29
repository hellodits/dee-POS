import { Router } from 'express'
import {
  createReservation,
  getReservations,
  getReservation,
  approveReservation,
  rejectReservation,
  getTodayReservations,
  checkReservationByPhone
} from '../controllers/reservationController'
import { protect, authorize } from '../middleware/auth'

const router = Router()

// Public routes (Customer App)
router.post('/', createReservation)
router.get('/check/:whatsapp', checkReservationByPhone)

// Protected routes (POS/Admin)
router.get('/', protect, getReservations)
router.get('/today', protect, getTodayReservations)
router.get('/:id', protect, getReservation)
router.patch('/:id/approve', protect, authorize('admin', 'manager'), approveReservation)
router.patch('/:id/reject', protect, authorize('admin', 'manager'), rejectReservation)

export default router
