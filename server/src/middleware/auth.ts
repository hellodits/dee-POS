import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User, IUser, IPermissions } from '../models/User'
import { Types } from 'mongoose'

export interface AuthRequest extends Request {
  user?: IUser & { 
    id: string
    permissions: IPermissions
    branch_id?: Types.ObjectId
  }
}

// JWT Payload interface for type safety
export interface JWTPayload {
  id: string
  role: string
  branch_id: string | null
}

/**
 * AUTH GUARD - Verify JWT Token
 * Extracts token from Authorization header, verifies it, and attaches user to request
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined

    // Extract token from Bearer header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      })
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'fallback-secret'
      ) as JWTPayload

      // Fetch user from database
      const user = await User.findById(decoded.id).select('+permissions')

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found. Token may be invalid.'
        })
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated. Contact administrator.'
        })
      }

      // Attach user to request with branch_id from token
      req.user = user as any
      req.user!.id = user._id.toString()
      // Use branch_id from token (more secure than from DB - prevents race conditions)
      req.user!.branch_id = decoded.branch_id ? new Types.ObjectId(decoded.branch_id) : undefined

      next()
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired. Please login again.'
        })
      }
      
      return res.status(401).json({
        success: false,
        error: 'Invalid token.'
      })
    }
  } catch (error) {
    next(error)
  }
}

/**
 * ROLE GUARD - Check user role
 * Returns 403 if user role is not in allowed roles
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      })
    }

    next()
  }
}

/**
 * PERMISSION GUARD - Check specific permission
 * More granular than role-based, checks user.permissions object
 */
export const requirePermission = (permission: keyof IPermissions) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    // Admin always has all permissions
    if (req.user.role === 'admin') {
      return next()
    }

    // Check specific permission
    if (!req.user.permissions?.[permission]) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required permission: ${permission}`
      })
    }

    next()
  }
}

/**
 * OPTIONAL AUTH - Attach user if token present, but don't require it
 * Useful for public endpoints that behave differently for logged-in users
 */
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (token) {
      try {
        const decoded = jwt.verify(
          token, 
          process.env.JWT_SECRET || 'fallback-secret'
        ) as JWTPayload

        const user = await User.findById(decoded.id)
        if (user && user.isActive) {
          req.user = user as any
          req.user!.id = user._id.toString()
          req.user!.branch_id = decoded.branch_id ? new Types.ObjectId(decoded.branch_id) : undefined
        }
      } catch {
        // Token invalid, but that's okay for optional auth
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * BRANCH FILTER HELPER - Get branch filter for queries
 * 
 * For OWNER role: Returns empty filter (access all) or specific branch if query param provided
 * For other roles: Returns strict filter with user's branch_id
 * 
 * Usage in controllers:
 *   const branchFilter = getBranchFilter(req)
 *   const orders = await Order.find({ ...branchFilter, ...otherFilters })
 */
export const getBranchFilter = (req: AuthRequest): { branch_id?: Types.ObjectId } => {
  const user = req.user

  if (!user) {
    throw new Error('User not authenticated')
  }

  // OWNER can access all branches or filter by specific branch
  if (user.role === 'owner') {
    const queryBranchId = req.query.branch_id as string
    if (queryBranchId && Types.ObjectId.isValid(queryBranchId)) {
      return { branch_id: new Types.ObjectId(queryBranchId) }
    }
    // No filter = access all branches
    return {}
  }

  // Non-OWNER users: STRICTLY enforce their branch_id
  if (!user.branch_id) {
    throw new Error('User has no assigned branch')
  }

  return { branch_id: user.branch_id }
}

/**
 * GET USER BRANCH ID - Get branch_id for write operations
 * 
 * For OWNER role: Must specify branch_id in query param or request body
 * For other roles: Returns their assigned branch_id
 * 
 * This prevents branch_id spoofing from client body
 */
export const getUserBranchId = (req: AuthRequest, allowBodyBranchId = false): Types.ObjectId => {
  const user = req.user

  if (!user) {
    throw new Error('User not authenticated')
  }

  // OWNER must specify which branch for write operations
  if (user.role === 'owner') {
    // Check query param first, then body (if allowed)
    const queryBranchId = req.query.branch_id as string
    const bodyBranchId = allowBodyBranchId ? req.body.branch_id : null

    const branchId = queryBranchId || bodyBranchId

    if (!branchId || !Types.ObjectId.isValid(branchId)) {
      throw new Error('OWNER must specify a valid branch_id for this operation')
    }

    return new Types.ObjectId(branchId)
  }

  // Non-OWNER users: Use their assigned branch_id
  if (!user.branch_id) {
    throw new Error('User has no assigned branch')
  }

  return user.branch_id
}

/**
 * REQUIRE BRANCH - Middleware to ensure user has a branch assigned
 * Use this for endpoints that require branch context
 */
export const requireBranch = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    })
  }

  // OWNER doesn't need a branch assigned
  if (req.user.role === 'owner') {
    return next()
  }

  // Other roles must have a branch
  if (!req.user.branch_id) {
    return res.status(403).json({
      success: false,
      error: 'No branch assigned to your account. Contact administrator.'
    })
  }

  next()
}
