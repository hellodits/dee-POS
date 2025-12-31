import { Router } from 'express'
import {
  salesReport,
  topProducts,
  dailyTrend,
  hourlyDistribution,
  inventoryMovement,
  lowStock,
  categoryPerformance,
  dashboardSummary,
  transactionReport,
  cashierReport,
  reservationReport,
  staffReport,
  revenueChart,
  reservationChart,
  exportOrders
} from '../controllers/reportController'
import { protect, authorize } from '../middleware/auth'

const router = Router()

// All report routes require authentication
router.use(protect)

// Dashboard endpoints (all authenticated users can access)
router.get('/dashboard', dashboardSummary)
router.get('/top-products', topProducts)
router.get('/daily-trend', dailyTrend)
router.get('/low-stock', lowStock)

// Export endpoints (admin/manager only)
router.get('/export-orders', authorize('admin', 'manager'), exportOrders)

// Detailed sales reports (requires admin/manager role)
router.get('/sales', authorize('admin', 'manager'), salesReport)
router.get('/hourly', authorize('admin', 'manager'), hourlyDistribution)
router.get('/categories', authorize('admin', 'manager'), categoryPerformance)

// Transaction-based financial reports (admin/manager only)
router.get('/transactions', authorize('admin', 'manager'), transactionReport)
router.get('/cashiers', authorize('admin', 'manager'), cashierReport)

// Reservation reports (admin/manager only)
router.get('/reservations', authorize('admin', 'manager'), reservationReport)
router.get('/reservation-chart', authorize('admin', 'manager'), reservationChart)

// Staff reports (admin/manager only)
router.get('/staff', authorize('admin', 'manager'), staffReport)

// Chart data
router.get('/revenue-chart', authorize('admin', 'manager'), revenueChart)

// Inventory reports
router.get('/inventory/:productId', authorize('admin', 'manager'), inventoryMovement)

export default router
