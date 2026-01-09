import { Router } from 'express'
import {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch
} from '../controllers/branchController'
import { protect, authorize } from '../middleware/auth'

const router = Router()

// Public routes (for customer app branch selection)
router.get('/', getBranches)
router.get('/:id', getBranch)

// Protected routes (OWNER only)
router.post('/', protect, authorize('owner'), createBranch)
router.put('/:id', protect, authorize('owner'), updateBranch)
router.delete('/:id', protect, authorize('owner'), deleteBranch)

export default router
