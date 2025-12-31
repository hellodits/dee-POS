import { Order } from '../models/Order'
import { InventoryLog } from '../models/InventoryLog'
import { Product } from '../models/Product'
import { Transaction } from '../models/Transaction'
import { Reservation } from '../models/Reservation'
import { Attendance } from '../models/Staff'
import { User } from '../models/User'

interface DateRange {
  start: Date
  end: Date
}

interface SalesReport {
  total_sales: number
  total_orders: number
  average_order_value: number
  by_payment_method: {
    method: string
    total: number
    count: number
  }[]
  by_source: {
    source: string
    total: number
    count: number
  }[]
}

interface ProductSalesReport {
  product_id: string
  name: string
  qty_sold: number
  revenue: number
  profit: number
}

interface DailySalesReport {
  date: string
  total: number
  orders: number
}

/**
 * SALES REPORT - Using MongoDB Aggregation Pipeline
 * NOT JS loops - leverages database-level computation
 */
export async function getSalesReport(dateRange: DateRange): Promise<SalesReport> {
  const matchStage = {
    $match: {
      createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      status: 'COMPLETED',
      payment_status: 'PAID'
    }
  }

  // Total sales aggregation
  const totalPipeline = await Order.aggregate([
    matchStage,
    {
      $group: {
        _id: null,
        total_sales: { $sum: '$financials.total' },
        total_orders: { $sum: 1 },
        average_order_value: { $avg: '$financials.total' }
      }
    }
  ])

  // Sales by payment method
  const byPaymentMethod = await Order.aggregate([
    matchStage,
    {
      $group: {
        _id: '$payment_method',
        total: { $sum: '$financials.total' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        method: '$_id',
        total: 1,
        count: 1
      }
    },
    { $sort: { total: -1 } }
  ])

  // Sales by source (POS vs WEB)
  const bySource = await Order.aggregate([
    matchStage,
    {
      $group: {
        _id: '$order_source',
        total: { $sum: '$financials.total' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        source: '$_id',
        total: 1,
        count: 1
      }
    }
  ])

  const totals = totalPipeline[0] || { total_sales: 0, total_orders: 0, average_order_value: 0 }

  return {
    total_sales: totals.total_sales,
    total_orders: totals.total_orders,
    average_order_value: Math.round(totals.average_order_value || 0),
    by_payment_method: byPaymentMethod,
    by_source: bySource
  }
}

/**
 * TOP SELLING PRODUCTS - Aggregation with $unwind
 */
export async function getTopSellingProducts(
  dateRange: DateRange, 
  limit: number = 10
): Promise<ProductSalesReport[]> {
  const pipeline = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        status: 'COMPLETED'
      }
    },
    // Unwind embedded items array
    { $unwind: '$items' },
    // Group by product
    {
      $group: {
        _id: '$items.product_id',
        name: { $first: '$items.name' },
        qty_sold: { $sum: '$items.qty' },
        revenue: { $sum: { $multiply: ['$items.price_at_moment', '$items.qty'] } }
      }
    },
    // Lookup product for cost_price to calculate profit
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    // Calculate profit
    {
      $project: {
        _id: 0,
        product_id: '$_id',
        name: 1,
        qty_sold: 1,
        revenue: 1,
        profit: {
          $subtract: [
            '$revenue',
            { $multiply: ['$qty_sold', { $ifNull: ['$product.cost_price', 0] }] }
          ]
        }
      }
    },
    { $sort: { qty_sold: -1 } },
    { $limit: limit }
  ])

  return pipeline
}

/**
 * DAILY SALES TREND - Time-based aggregation
 */
export async function getDailySalesTrend(dateRange: DateRange): Promise<DailySalesReport[]> {
  const pipeline = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        status: 'COMPLETED',
        payment_status: 'PAID'
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        total: { $sum: '$financials.total' },
        orders: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        total: 1,
        orders: 1
      }
    },
    { $sort: { date: 1 } }
  ])

  return pipeline
}

/**
 * HOURLY SALES DISTRIBUTION - Peak hours analysis
 */
export async function getHourlySalesDistribution(dateRange: DateRange) {
  const pipeline = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        status: 'COMPLETED'
      }
    },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        total: { $sum: '$financials.total' },
        orders: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        hour: '$_id',
        total: 1,
        orders: 1
      }
    },
    { $sort: { hour: 1 } }
  ])

  return pipeline
}

/**
 * INVENTORY MOVEMENT REPORT
 */
export async function getInventoryMovementReport(
  productId: string,
  dateRange: DateRange
) {
  const pipeline = await InventoryLog.aggregate([
    {
      $match: {
        product_id: productId,
        timestamp: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: '$reason',
        total_change: { $sum: '$qty_change' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        reason: '$_id',
        total_change: 1,
        count: 1
      }
    }
  ])

  return pipeline
}

/**
 * LOW STOCK ALERT
 */
export async function getLowStockProducts(threshold: number = 10) {
  return Product.find({
    is_active: true,
    stock: { $lte: threshold }
  })
  .select('name stock category')
  .sort({ stock: 1 })
}

/**
 * CATEGORY PERFORMANCE
 */
export async function getCategoryPerformance(dateRange: DateRange) {
  const pipeline = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        status: 'COMPLETED'
      }
    },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: '$product.category',
        revenue: { $sum: { $multiply: ['$items.price_at_moment', '$items.qty'] } },
        qty_sold: { $sum: '$items.qty' },
        unique_products: { $addToSet: '$items.product_id' }
      }
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        revenue: 1,
        qty_sold: 1,
        product_count: { $size: '$unique_products' }
      }
    },
    { $sort: { revenue: -1 } }
  ])

  return pipeline
}


/**
 * TRANSACTION-BASED FINANCIAL REPORT
 * Uses Transaction collection for accurate financial reporting
 * Aggregation Pipeline - NO JS loops
 */
export async function getTransactionReport(dateRange: DateRange) {
  // Total revenue from transactions
  const summary = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: '$type',
        total_amount: { $sum: '$amount' },
        total_tax: { $sum: '$tax' },
        total_service: { $sum: '$service_charge' },
        total_discount: { $sum: '$discount' },
        count: { $sum: 1 }
      }
    }
  ])

  // By payment method
  const byPaymentMethod = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        type: 'SALE'
      }
    },
    {
      $group: {
        _id: '$payment_method',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        method: '$_id',
        total: 1,
        count: 1
      }
    },
    { $sort: { total: -1 } }
  ])

  // Daily breakdown
  const dailyBreakdown = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        type: 'SALE'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$amount' },
        tax_collected: { $sum: '$tax' },
        transactions: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        revenue: 1,
        tax_collected: 1,
        transactions: 1
      }
    },
    { $sort: { date: 1 } }
  ])

  // Calculate totals
  const sales = summary.find(s => s._id === 'SALE') || { total_amount: 0, count: 0 }
  const refunds = summary.find(s => s._id === 'REFUND') || { total_amount: 0, count: 0 }

  return {
    net_revenue: sales.total_amount + refunds.total_amount, // refunds are negative
    gross_sales: sales.total_amount,
    refunds: Math.abs(refunds.total_amount),
    total_transactions: sales.count,
    total_refunds: refunds.count,
    by_payment_method: byPaymentMethod,
    daily_breakdown: dailyBreakdown
  }
}

/**
 * CASHIER PERFORMANCE REPORT
 * Track sales by user/cashier
 */
export async function getCashierPerformance(dateRange: DateRange) {
  return Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        type: 'SALE',
        user_id: { $exists: true }
      }
    },
    {
      $group: {
        _id: '$user_id',
        total_sales: { $sum: '$amount' },
        transactions: { $sum: 1 },
        avg_transaction: { $avg: '$amount' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        user_id: '$_id',
        username: '$user.username',
        total_sales: 1,
        transactions: 1,
        avg_transaction: { $round: ['$avg_transaction', 0] }
      }
    },
    { $sort: { total_sales: -1 } }
  ])
}


/**
 * RESERVATION REPORT
 * Aggregation for reservation statistics
 */
export async function getReservationReport(dateRange: DateRange) {
  // Summary by status
  const byStatus = await Reservation.aggregate([
    {
      $match: {
        date: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total_pax: { $sum: '$pax' }
      }
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1,
        total_pax: 1
      }
    }
  ])

  // Daily breakdown
  const dailyBreakdown = await Reservation.aggregate([
    {
      $match: {
        date: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          status: '$status'
        },
        count: { $sum: 1 },
        total_pax: { $sum: '$pax' }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
            total_pax: '$total_pax'
          }
        },
        total: { $sum: '$count' }
      }
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        statuses: 1,
        total: 1
      }
    },
    { $sort: { date: 1 } }
  ])

  // Recent reservations list
  const recentReservations = await Reservation.find({
    date: { $gte: dateRange.start, $lte: dateRange.end }
  })
  .select('guest_name whatsapp date time pax status createdAt')
  .sort({ date: -1, time: -1 })
  .limit(50)
  .lean()

  // Calculate totals
  const totals = byStatus.reduce((acc, item) => {
    acc.total += item.count
    acc.total_pax += item.total_pax
    if (item.status === 'APPROVED' || item.status === 'COMPLETED') {
      acc.confirmed += item.count
    } else if (item.status === 'PENDING') {
      acc.pending += item.count
    } else if (item.status === 'CANCELLED' || item.status === 'REJECTED') {
      acc.cancelled += item.count
    }
    return acc
  }, { total: 0, total_pax: 0, confirmed: 0, pending: 0, cancelled: 0 })

  return {
    summary: totals,
    by_status: byStatus,
    daily_breakdown: dailyBreakdown,
    recent_reservations: recentReservations
  }
}

/**
 * STAFF PERFORMANCE REPORT
 * Combines attendance data with sales performance
 */
export async function getStaffReport(dateRange: DateRange) {
  // Get all active staff
  const staff = await User.find({ isActive: true })
    .select('username role')
    .lean()

  // Get attendance summary per staff
  const attendanceSummary = await Attendance.aggregate([
    {
      $match: {
        date: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: '$staff_id',
        total_days: { $sum: 1 },
        present_days: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
        },
        late_days: {
          $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
        },
        absent_days: {
          $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
        },
        total_hours: {
          $sum: {
            $cond: [
              { $and: ['$check_in', '$check_out'] },
              {
                $divide: [
                  { $subtract: ['$check_out', '$check_in'] },
                  3600000 // Convert ms to hours
                ]
              },
              0
            ]
          }
        }
      }
    }
  ])

  // Get sales performance per staff (cashier)
  const salesPerformance = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        type: 'SALE',
        user_id: { $exists: true }
      }
    },
    {
      $group: {
        _id: '$user_id',
        total_sales: { $sum: '$amount' },
        total_transactions: { $sum: 1 },
        avg_transaction: { $avg: '$amount' }
      }
    }
  ])

  // Get orders handled per staff
  const ordersHandled = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        user_id: { $exists: true }
      }
    },
    {
      $group: {
        _id: '$user_id',
        total_orders: { $sum: 1 }
      }
    }
  ])

  // Combine all data
  const staffReport = staff.map(s => {
    const attendance = attendanceSummary.find(a => a._id?.toString() === s._id.toString())
    const sales = salesPerformance.find(sp => sp._id?.toString() === s._id.toString())
    const orders = ordersHandled.find(o => o._id?.toString() === s._id.toString())

    return {
      staff_id: s._id,
      username: s.username,
      role: s.role,
      attendance: {
        total_days: attendance?.total_days || 0,
        present_days: attendance?.present_days || 0,
        late_days: attendance?.late_days || 0,
        absent_days: attendance?.absent_days || 0,
        total_hours: Math.round((attendance?.total_hours || 0) * 100) / 100
      },
      performance: {
        total_orders: orders?.total_orders || 0,
        total_sales: sales?.total_sales || 0,
        total_transactions: sales?.total_transactions || 0,
        avg_transaction: Math.round(sales?.avg_transaction || 0)
      }
    }
  })

  // Summary
  const summary = {
    total_staff: staff.length,
    total_hours_worked: staffReport.reduce((sum, s) => sum + s.attendance.total_hours, 0),
    total_sales: staffReport.reduce((sum, s) => sum + s.performance.total_sales, 0),
    total_orders: staffReport.reduce((sum, s) => sum + s.performance.total_orders, 0)
  }

  return {
    summary,
    staff: staffReport
  }
}

/**
 * MONTHLY CHART DATA
 * For revenue/reservation charts by month
 */
export async function getMonthlyRevenueChart(dateRange: DateRange) {
  const pipeline = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        status: 'COMPLETED',
        payment_status: 'PAID'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        total: { $sum: '$financials.total' },
        orders: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        total: 1,
        orders: 1
      }
    },
    { $sort: { year: 1, month: 1 } }
  ])

  // Convert to month names
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return pipeline.map(item => ({
    month: monthNames[item.month - 1],
    total: item.total,
    orders: item.orders
  }))
}

export async function getMonthlyReservationChart(dateRange: DateRange) {
  const pipeline = await Reservation.aggregate([
    {
      $match: {
        date: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: {
          year: '$_id.year',
          month: '$_id.month'
        },
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        statuses: 1,
        total: 1
      }
    },
    { $sort: { year: 1, month: 1 } }
  ])

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return pipeline.map(item => {
    const confirmed = item.statuses.find((s: { status: string; count: number }) => s.status === 'APPROVED' || s.status === 'COMPLETED')?.count || 0
    const pending = item.statuses.find((s: { status: string; count: number }) => s.status === 'PENDING')?.count || 0
    const cancelled = item.statuses.find((s: { status: string; count: number }) => s.status === 'CANCELLED' || s.status === 'REJECTED')?.count || 0

    return {
      month: monthNames[item.month - 1],
      confirmed,
      pending,
      cancelled,
      total: item.total
    }
  })
}
