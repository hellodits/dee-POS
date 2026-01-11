import { Response, NextFunction } from 'express'
import { AuthRequest, getBranchFilter } from '../middleware/auth'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../services/notificationService'

/**
 * @desc    Get all notifications for current user
 * @route   GET /api/notifications
 * @access  Private - Branch filtered
 */
export const getAllNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    const branchFilter = getBranchFilter(req)
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 50
    const unread_only = req.query.unread_only === 'true'

    const result = await getNotifications(userId, { page, limit, unread_only }, branchFilter)

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
 * @access  Private - Branch filtered
 */
export const markNotificationAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    const branchFilter = getBranchFilter(req)
    const notification = await markAsRead(req.params.id, userId, branchFilter)

    if (!notification) {
      res.status(404).json({
        success: false,
        error: 'Notification not found or access denied'
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
 * @access  Private - Branch filtered
 */
export const markAllNotificationsAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    const branchFilter = getBranchFilter(req)
    const result = await markAllAsRead(userId, branchFilter)

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
 * @access  Private - Branch filtered
 */
export const removeNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id
    const branchFilter = getBranchFilter(req)
    const notification = await deleteNotification(req.params.id, userId, branchFilter)

    if (!notification) {
      res.status(404).json({
        success: false,
        error: 'Notification not found or access denied'
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
