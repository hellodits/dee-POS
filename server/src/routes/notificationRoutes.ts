import { Router } from 'express'
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification
} from '../controllers/notificationController'
import { protect } from '../middleware/auth'

const router = Router()

// All notification routes require authentication
router.use(protect)

// Get all notifications
router.get('/', getAllNotifications)

// Mark all as read (must be before /:id routes)
router.patch('/read-all', markAllNotificationsAsRead)

// Mark single notification as read
router.patch('/:id/read', markNotificationAsRead)

// Delete notification
router.delete('/:id', removeNotification)

export default router
