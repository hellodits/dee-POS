import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err }
  error.message = err.message

  // Log error with more details
  console.error('🔴 Error Handler caught:', {
    name: err.name,
    message: err.message,
    path: req.path,
    method: req.method,
    stack: err.stack?.split('\n').slice(0, 3).join('\n')
  })

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const castErr = err as any
    console.error('🔴 CastError details:', {
      kind: castErr.kind,
      value: castErr.value,
      path: castErr.path
    })
    const message = 'Resource not found'
    error = { ...error, message, statusCode: 404 }
  }

  // Mongoose duplicate key
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered'
    error = { ...error, message, statusCode: 400 }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ')
    error = { ...error, message, statusCode: 400 }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  })
}