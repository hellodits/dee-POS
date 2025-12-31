import { Router } from 'express'
import { body } from 'express-validator'
import { protect, authorize } from '../middleware/auth'
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserPermissions
} from '../controllers/userController'

const router = Router()

// All routes require authentication and admin/manager role
router.use(protect)
router.use(authorize('admin', 'manager'))

// Validation rules
const createUserValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['admin', 'manager', 'cashier', 'kitchen'])
    .withMessage('Invalid role')
]

const updateUserValidation = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'cashier', 'kitchen'])
    .withMessage('Invalid role')
]

// Routes
router.get('/', getUsers)
router.get('/:id', getUserById)
router.post('/', createUserValidation, createUser)
router.put('/:id', updateUserValidation, updateUser)
router.delete('/:id', deleteUser)
router.patch('/:id/permissions', updateUserPermissions)

export default router
