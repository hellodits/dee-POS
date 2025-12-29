import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User, IUser, IPermissions } from '../models/User'

export interface AuthRequest extends Request {
  user?: IUser & { id: string; permissions: IPermissions }
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
      ) as { id: string }

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

      // Attach user to request
      req.user = user as any
      req.user!.id = user._id.toString()

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
        ) as { id: string }

        const user = await User.findById(decoded.id)
        if (user && user.isActive) {
          req.user = user as any
          req.user!.id = user._id.toString()
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
