import { Order } from '../models/Order'
import { InventoryLog } from '../models/InventoryLog'
import { Product } from '../models/Product'

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
