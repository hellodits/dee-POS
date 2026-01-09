import { Request, Response, NextFunction } from 'express'
import { Branch } from '../models/Branch'
import { AuthRequest } from '../middleware/auth'

/**
 * @desc    Get all branches
 * @route   GET /api/branches
 * @access  Public (for customer app) / Private (for POS)
 */
export const getBranches = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { active_only } = req.query

    const filter: any = {}
    if (active_only === 'true') {
      filter.is_active = true
    }

    const branches = await Branch.find(filter).sort({ name: 1 })

    res.json({
      success: true,
      data: branches
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get single branch
 * @route   GET /api/branches/:id
 * @access  Public
 */
export const getBranch = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const branch = await Branch.findById(req.params.id)

    if (!branch) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      })
    }

    res.json({
      success: true,
      data: branch
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create new branch
 * @route   POST /api/branches
 * @access  Private (OWNER only)
 */
export const createBranch = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Only OWNER can create branches
    if (req.user?.role !== 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Only OWNER can create branches'
      })
    }

    const { name, address, phone } = req.body

    // Validate required fields
    if (!name || !address || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name, address, and phone are required'
      })
    }

    const branch = await Branch.create({
      name,
      address,
      phone,
      is_active: true
    })

    res.status(201).json({
      success: true,
      data: branch
    })
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Branch with this name already exists'
      })
    }
    next(error)
  }
}

/**
 * @desc    Update branch
 * @route   PUT /api/branches/:id
 * @access  Private (OWNER only)
 */
export const updateBranch = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Only OWNER can update branches
    if (req.user?.role !== 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Only OWNER can update branches'
      })
    }

    const { name, address, phone, is_active } = req.body

    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { name, address, phone, is_active },
      { new: true, runValidators: true }
    )

    if (!branch) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      })
    }

    res.json({
      success: true,
      data: branch
    })
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Branch with this name already exists'
      })
    }
    next(error)
  }
}

/**
 * @desc    Delete branch
 * @route   DELETE /api/branches/:id
 * @access  Private (OWNER only)
 */
export const deleteBranch = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Only OWNER can delete branches
    if (req.user?.role !== 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Only OWNER can delete branches'
      })
    }

    const branch = await Branch.findByIdAndDelete(req.params.id)

    if (!branch) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      })
    }

    res.json({
      success: true,
      message: 'Branch deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}
