import { Request, Response, NextFunction } from 'express'
import { Order } from '../models/Order'
import {
  getSalesReport,
  getTopSellingProducts,
  getDailySalesTrend,
  getHourlySalesDistribution,
  getInventoryMovementReport,
  getLowStockProducts,
  getCategoryPerformance,
  getTransactionReport,
  getCashierPerformance,
  getReservationReport,
  getStaffReport,
  getMonthlyRevenueChart,
  getMonthlyReservationChart
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


/**
 * @desc    Get transaction-based financial report
 * @route   GET /api/reports/transactions
 * @access  Private (POS - requires can_see_report)
 */
export const transactionReport = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const dateRange = parseDateRange(req)
    const report = await getTransactionReport(dateRange)

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
 * @desc    Get cashier performance report
 * @route   GET /api/reports/cashiers
 * @access  Private (POS - requires can_see_report)
 */
export const cashierReport = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const dateRange = parseDateRange(req)
    const report = await getCashierPerformance(dateRange)

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
 * @desc    Get reservation report
 * @route   GET /api/reports/reservations
 * @access  Private (POS - requires can_see_report)
 */
export const reservationReport = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const dateRange = parseDateRange(req)
    const report = await getReservationReport(dateRange)

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
 * @desc    Get staff performance report
 * @route   GET /api/reports/staff
 * @access  Private (POS - requires can_see_report)
 */
export const staffReport = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const dateRange = parseDateRange(req)
    const report = await getStaffReport(dateRange)

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
 * @desc    Get monthly revenue chart data
 * @route   GET /api/reports/revenue-chart
 * @access  Private (POS - requires can_see_report)
 */
export const revenueChart = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const dateRange = parseDateRange(req)
    const chartData = await getMonthlyRevenueChart(dateRange)

    res.json({
      success: true,
      data: chartData,
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
 * @desc    Get monthly reservation chart data
 * @route   GET /api/reports/reservation-chart
 * @access  Private (POS - requires can_see_report)
 */
export const reservationChart = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const dateRange = parseDateRange(req)
    const chartData = await getMonthlyReservationChart(dateRange)

    res.json({
      success: true,
      data: chartData,
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
 * @desc    Export orders to Excel
 * @route   GET /api/reports/export-orders
 * @access  Private (POS - requires can_see_report)
 */
export const exportOrders = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const dateRange = parseDateRange(req)
    const { status, payment_status, order_source } = req.query
    
    // Build filter
    const filter: any = {
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    }
    
    if (status && status !== 'all') {
      filter.status = status
    }
    
    if (payment_status && payment_status !== 'all') {
      filter.payment_status = payment_status
    }
    
    if (order_source && order_source !== 'all') {
      filter.order_source = order_source
    }

    const orders = await Order.find(filter)
      .populate('table_id', 'number name')
      .populate('user_id', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .lean()

    // Transform data for export
    const exportData = orders.map(order => ({
      'No. Order': order.order_number,
      'Tanggal': new Date(order.createdAt).toLocaleDateString('id-ID'),
      'Waktu': new Date(order.createdAt).toLocaleTimeString('id-ID'),
      'Sumber': order.order_source === 'POS' ? 'Kasir' : 'Online',
      'Meja': order.table_id ? `${(order.table_id as any).number} - ${(order.table_id as any).name}` : '-',
      'Kasir': order.user_id ? `${(order.user_id as any).firstName || ''} ${(order.user_id as any).lastName || ''}`.trim() || (order.user_id as any).username : '-',
      'Tamu': order.guest_info ? order.guest_info.name : '-',
      'WhatsApp': order.guest_info ? order.guest_info.whatsapp : '-',
      'Jumlah Tamu': order.guest_info ? order.guest_info.pax : '-',
      'Status Order': order.status,
      'Status Pembayaran': order.payment_status,
      'Metode Pembayaran': order.payment_method || '-',
      'Subtotal': order.financials.subtotal,
      'Diskon': order.financials.discount,
      'Pajak': order.financials.tax,
      'Service Charge': order.financials.service_charge,
      'Total': order.financials.total,
      'Catatan': order.notes || '-',
      'Selesai': order.completed_at ? new Date(order.completed_at).toLocaleString('id-ID') : '-'
    }))

    res.json({
      success: true,
      data: exportData,
      total: exportData.length,
      date_range: {
        from: dateRange.start,
        to: dateRange.end
      }
    })

  } catch (error) {
    next(error)
  }
}
