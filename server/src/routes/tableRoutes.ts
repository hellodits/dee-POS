import { Router } from 'express'
import {
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  reserveTable,
  releaseTable,
  resetTable,
  getTableSummary
} from '../controllers/tableController'
import { protect, authorize } from '../middleware/auth'

const router = Router()

// Public routes (Customer App)
router.get('/', getTables)
router.post('/:id/reserve', reserveTable)

// Protected routes (POS)
router.get('/summary', protect, getTableSummary)
router.get('/:id', protect, getTable)
router.post('/', protect, authorize('admin', 'manager'), createTable)
router.put('/:id', protect, authorize('admin', 'manager'), updateTable)
router.delete('/:id', protect, authorize('admin'), deleteTable)
router.post('/:id/release', protect, releaseTable)
router.patch('/:id/reset', protect, resetTable)

export default router
