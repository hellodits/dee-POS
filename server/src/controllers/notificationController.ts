import { Request, Response, NextFunction } from 'express'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../services/notificationService'

interface AuthRequest extends Request {
  user?: { id: string }
}

/**
 * @desc    Get all notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getAllNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 50
    const unread_only = req.query.unread_only === 'true'

    const result = await getNotifications(userId, { page, limit, unread_only })

    res.json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
      stats: result.stats
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    const notification = await markAsRead(req.params.id, userId)

    if (!notification) {
      res.status(404).json({
        success: false,
        error: 'Notification not found'
      })
      return
    }

    res.json({
      success: true,
      data: notification
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    const result = await markAllAsRead(userId)

    res.json({
      success: true,
      message: `${result.modified} notifications marked as read`
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const removeNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    const notification = await deleteNotification(req.params.id, userId)

    if (!notification) {
      res.status(404).json({
        success: false,
        error: 'Notification not found'
      })
      return
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    })
  } catch (error) {
    next(error)
  }
}
