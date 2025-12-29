import { Router } from 'express'
import { body } from 'express-validator'
import { AuthController } from '../controllers/authController'
import { protect } from '../middleware/auth'

const router = Router()
const authController = new AuthController()

// Validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'cashier'])
    .withMessage('Role must be admin, manager, or cashier')
]

const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
]

// Routes
router.post('/register', registerValidation, authController.register)
router.post('/login', loginValidation, authController.login)
router.get('/me', protect, authController.getMe)
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword)

export default router