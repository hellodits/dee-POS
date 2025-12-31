import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { AuthService } from '../services/authService'
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../config/cloudinary'

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  // @desc    Register user
  // @route   POST /api/auth/register
  // @access  Public
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        })
      }

      const { username, email, password, role } = req.body
      const result = await this.authService.register({ username, email, password, role })

      res.status(201).json({
        success: true,
        data: result
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Registration failed'
      })
    }
  }

  // @desc    Login user
  // @route   POST /api/auth/login
  // @access  Public
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        })
      }

      const { email, password } = req.body
      const result = await this.authService.login({ email, password })

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message || 'Login failed'
      })
    }
  }

  // @desc    Get current logged in user
  // @route   GET /api/auth/me
  // @access  Private
  getMe = async (req: any, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.getMe(req.user.id)

      res.status(200).json({
        success: true,
        data: user
      })
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message || 'User not found'
      })
    }
  }

  // @desc    Update user profile
  // @route   PUT /api/auth/profile
  // @access  Private
  updateProfile = async (req: any, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName, email, address, newPassword } = req.body
      
      // Handle avatar upload to Cloudinary
      let avatarUrl: string | undefined
      if (req.file && req.file.buffer && req.file.buffer.length > 0) {
        console.log('📸 Uploading avatar to Cloudinary...')
        
        // Get current user to check for existing avatar
        const currentUser = await this.authService.getMe(req.user.id)
        
        // Delete old avatar if exists
        if (currentUser.avatar) {
          const oldPublicId = extractPublicId(currentUser.avatar)
          if (oldPublicId) {
            await deleteFromCloudinary(oldPublicId)
            console.log('🗑️ Old avatar deleted')
          }
        }
        
        // Upload new avatar
        const result = await uploadToCloudinary(req.file, {
          folder: 'deepos/avatars',
          width: 200,
          height: 200
        })
        avatarUrl = result.secure_url
        console.log('✅ Avatar uploaded:', avatarUrl)
      }

      const updateData: any = {}
      if (firstName !== undefined) updateData.firstName = firstName
      if (lastName !== undefined) updateData.lastName = lastName
      if (email !== undefined) updateData.email = email
      if (address !== undefined) updateData.address = address
      if (avatarUrl) updateData.avatar = avatarUrl
      if (newPassword) updateData.password = newPassword

      const user = await this.authService.updateProfile(req.user.id, updateData)

      res.status(200).json({
        success: true,
        data: user,
        message: 'Profile updated successfully'
      })
    } catch (error: any) {
      console.error('Update profile error:', error)
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update profile'
      })
    }
  }

  // @desc    Forgot password
  // @route   POST /api/auth/forgot-password
  // @access  Public
  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        })
      }

      const { email } = req.body
      await this.authService.forgotPassword(email)

      res.status(200).json({
        success: true,
        message: 'Password reset instructions sent to email'
      })
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message || 'Password reset failed'
      })
    }
  }
}