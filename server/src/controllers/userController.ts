import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { User } from '../models/User'

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin/Manager)
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, search, active_only, page = 1, limit = 20 } = req.query

    // Build filter
    const filter: any = {}
    
    if (role) filter.role = role
    if (active_only === 'true') filter.isActive = true
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter)
    ])

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private (Admin/Manager)
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private (Admin/Manager)
 */
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { username, email, password, role, firstName, lastName } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email or username'
      })
    }

    const user = await User.create({
      username,
      email,
      password,
      role,
      firstName,
      lastName
    })

    // Return user without password
    const userResponse = await User.findById(user._id).select('-password')

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'User created successfully'
    })
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email or username'
      })
    }
    next(error)
  }
}

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (Admin/Manager)
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { username, email, password, role, firstName, lastName, isActive } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Update fields
    if (username) user.username = username
    if (email) user.email = email
    if (password) user.password = password // Will be hashed by pre-save hook
    if (role) user.role = role
    if (firstName !== undefined) user.firstName = firstName
    if (lastName !== undefined) user.lastName = lastName
    if (isActive !== undefined) user.isActive = isActive

    await user.save()

    // Return user without password
    const userResponse = await User.findById(user._id).select('-password')

    res.json({
      success: true,
      data: userResponse,
      message: 'User updated successfully'
    })
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email or username already in use'
      })
    }
    next(error)
  }
}

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user

    // Only admin can delete users
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admin can delete users'
      })
    }

    // Prevent self-deletion
    if (req.params.id === currentUser.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      })
    }

    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update user permissions
 * @route   PATCH /api/users/:id/permissions
 * @access  Private (Admin only)
 */
export const updateUserPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user

    // Only admin can update permissions
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admin can update permissions'
      })
    }

    const { permissions } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Update permissions
    if (permissions) {
      user.permissions = {
        ...user.permissions,
        ...permissions
      }
    }

    await user.save()

    // Return user without password
    const userResponse = await User.findById(user._id).select('-password')

    res.json({
      success: true,
      data: userResponse,
      message: 'Permissions updated successfully'
    })
  } catch (error) {
    next(error)
  }
}
