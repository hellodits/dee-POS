import { Request, Response, NextFunction } from 'express'
import {
  getSalesReport,
  getTopSellingProducts,
  getDailySalesTrend,
  getHourlySalesDistribution,
  getInventoryMovementReport,
  getLowStockProducts,
  getCategoryPerformance
} from '../services/reportService'

/**
 * Parse date range from query params
 */
function parseDateRange(req: Request): { start: Date; end: Date } {
  const { date_from, date_to, period } = req.query

  let start: Date
  let end: Date = new Date()
  end.setHours(23, 59, 59, 999)

  if (date_from && date_to) {
    start = new Date(date_from as string)
    end = new Date(date_to as string)
    end.setHours(23, 59, 59, 999)
  } else {
    // Default periods
    switch (period) {
      case 'week':
        start = new Date()
        start.setDate(start.getDate() - 7)
        break
      case 'month':
        start = new Date()
        start.setMonth(start.getMonth() - 1)
        break
      case 'year':
        start = new Date()
        start.setFullYear(start.getFullYear() - 1)
        break
      default: // today
        start = new Date()
        start.setHours(0, 0, 0, 0)
    }
  }

  return { start, end }
}

/**
 * @desc    Get sales report
 * @route   GET /api/reports/sales
 * @access  Private (POS - requires can_see_report)
 */
export const salesReport = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const dateRange = parseDateRange(req)
    const report = await getSalesReport(dateRange)

    res.json({
      success: true,
      data: report,
      date_range: {
        from: dateRange.start,
        to: dateRange.end
      }
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get top selling products
 * @route   GET /api/reports/top-products
 * @access  Private (POS - requires can_see_report)
 */
export const topProducts = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const dateRange = parseDateRange(req)
    const limit = Number(req.query.limit) || 10
    
    const products = await getTopSellingProducts(dateRange, limit)

    res.json({
      success: true,
      data: products,
      date_range: {
        from: dateRange.start,
        to: dateRange.end
      }
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get daily sales trend
 * @route   GET /api/reports/daily-trend
 * @access  Private (POS - requires can_see_report)
 */
export const dailyTrend = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const dateRange = parseDateRange(req)
    const trend = await getDailySalesTrend(dateRange)

    res.json({
      success: true,
      data: trend,
      date_range: {
        from: dateRange.start,
        to: dateRange.end
      }
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get hourly sales distribution
 * @route   GET /api/reports/hourly
 * @access  Private (POS - requires can_see_report)
 */
export const hourlyDistribution = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const dateRange = parseDateRange(req)
    const distribution = await getHourlySalesDistribution(dateRange)

    res.json({
      success: true,
      data: distribution,
      date_range: {
        from: dateRange.start,
        to: dateRange.end
      }
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get inventory movement for a product
 * @route   GET /api/reports/inventory/:productId
 * @access  Private (POS - requires can_manage_inventory)
 */
export const inventoryMovement = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const dateRange = parseDateRange(req)
    const movement = await getInventoryMovementReport(req.params.productId, dateRange)

    res.json({
      success: true,
      data: movement,
      date_range: {
        from: dateRange.start,
        to: dateRange.end
      }
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get low stock products
 * @route   GET /api/reports/low-stock
 * @access  Private (POS - requires can_manage_inventory)
 */
export const lowStock = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const threshold = Number(req.query.threshold) || 10
    const products = await getLowStockProducts(threshold)

    res.json({
      success: true,
      data: products,
      threshold
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get category performance
 * @route   GET /api/reports/categories
 * @access  Private (POS - requires can_see_report)
 */
export const categoryPerformance = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const dateRange = parseDateRange(req)
    const performance = await getCategoryPerformance(dateRange)

    res.json({
      success: true,
      data: performance,
      date_range: {
        from: dateRange.start,
        to: dateRange.end
      }
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get dashboard summary
 * @route   GET /api/reports/dashboard
 * @access  Private (POS)
 */
export const dashboardSummary = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Today's date range
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))
    const todayRange = { start: startOfDay, end: endOfDay }

    // Get today's sales
    const todaySales = await getSalesReport(todayRange)
    
    // Get low stock count
    const lowStockProducts = await getLowStockProducts(10)
    
    // Get top 5 products today
    const topProductsToday = await getTopSellingProducts(todayRange, 5)

    res.json({
      success: true,
      data: {
        today: {
          total_sales: todaySales.total_sales,
          total_orders: todaySales.total_orders,
          average_order: todaySales.average_order_value
        },
        low_stock_count: lowStockProducts.length,
        top_products: topProductsToday
      }
    })

  } catch (error) {
    next(error)
  }
}
