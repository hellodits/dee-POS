import { Router } from 'express'
import {
  salesReport,
  topProducts,
  dailyTrend,
  hourlyDistribution,
  inventoryMovement,
  lowStock,
  categoryPerformance,
  dashboardSummary
} from '../controllers/reportController'
import { protect, authorize } from '../middleware/auth'

const router = Router()

// All report routes require authentication
router.use(protect)

// Dashboard (all authenticated users)
router.get('/dashboard', dashboardSummary)

// Sales reports (requires can_see_report permission)
router.get('/sales', authorize('admin', 'manager'), salesReport)
router.get('/top-products', authorize('admin', 'manager'), topProducts)
router.get('/daily-trend', authorize('admin', 'manager'), dailyTrend)
router.get('/hourly', authorize('admin', 'manager'), hourlyDistribution)
router.get('/categories', authorize('admin', 'manager'), categoryPerformance)

// Inventory reports
router.get('/low-stock', lowStock)
router.get('/inventory/:productId', authorize('admin', 'manager'), inventoryMovement)

export default router
