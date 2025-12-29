import { Request, Response, NextFunction } from 'express'
import { Order } from '../models/Order'
import { Table } from '../models/Table'
import { emitKitchenUpdate, emitOrderStatusUpdate } from '../config/socket'

/**
 * @desc    Get active orders for Kitchen Display System
 * @route   GET /api/kitchen/orders
 * @access  Private (POS/Kitchen)
 */
export const getKitchenOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Query only active orders with projection for performance
    const orders = await Order.find({
      status: { $in: ['CONFIRMED', 'COOKING'] }
    })
    .select('order_number items table_id status createdAt notes') // Projection
    .populate('table_id', 'number name')
    .sort({ createdAt: 1 }) // FIFO - oldest first

    // Group by status for KDS display
    const confirmed = orders.filter(o => o.status === 'CONFIRMED')
    const cooking = orders.filter(o => o.status === 'COOKING')

    res.json({
      success: true,
      data: {
        orders,
        summary: {
          total: orders.length,
          confirmed: confirmed.length,
          cooking: cooking.length
        }
      }
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update order status from Kitchen
 * @route   PATCH /api/kitchen/orders/:id/status
 * @access  Private (POS/Kitchen)
 */
export const updateKitchenOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body
    const validStatuses = ['COOKING', 'READY']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Kitchen can only set: ${validStatuses.join(', ')}`
      })
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Validate status transition
    if (status === 'COOKING' && order.status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        error: 'Can only start cooking CONFIRMED orders'
      })
    }

    if (status === 'READY' && order.status !== 'COOKING') {
      return res.status(400).json({
        success: false,
        error: 'Can only mark COOKING orders as READY'
      })
    }

    // Update status using $set
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    )
    .select('order_number items table_id status createdAt')
    .populate('table_id', 'number name')

    // 🔌 EMIT SOCKET EVENTS
    const tableInfo = updatedOrder?.table_id as any
    
    // Kitchen-specific update
    emitKitchenUpdate({
      order_id: req.params.id,
      order_number: order.order_number,
      status: status as 'COOKING' | 'READY',
      table_number: tableInfo?.number
    })

    // General order status update
    emitOrderStatusUpdate({
      order_id: req.params.id,
      order_number: order.order_number,
      status,
      previous_status: order.status,
      updated_at: new Date().toISOString()
    })

    // Log notification for READY orders
    if (status === 'READY') {
      console.log(`🔔 Order ${order.order_number} is READY for pickup/serving`)
    }

    res.json({
      success: true,
      data: updatedOrder,
      message: `Order status updated to ${status}`
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get order queue statistics
 * @route   GET /api/kitchen/stats
 * @access  Private (POS/Kitchen)
 */
export const getKitchenStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await Order.aggregate([
      {
        $match: {
          status: { $in: ['PENDING', 'CONFIRMED', 'COOKING', 'READY'] }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          oldest: { $min: '$createdAt' }
        }
      }
    ])

    // Calculate average wait time for completed orders today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const avgWaitTime = await Order.aggregate([
      {
        $match: {
          status: 'COMPLETED',
          createdAt: { $gte: today }
        }
      },
      {
        $project: {
          waitTime: {
            $subtract: ['$completed_at', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgWaitMs: { $avg: '$waitTime' },
          count: { $sum: 1 }
        }
      }
    ])

    const result: any = {
      pending: 0,
      confirmed: 0,
      cooking: 0,
      ready: 0
    }

    stats.forEach(s => {
      result[s._id.toLowerCase()] = s.count
    })

    result.avg_wait_minutes = avgWaitTime[0] 
      ? Math.round(avgWaitTime[0].avgWaitMs / 60000) 
      : 0
    result.completed_today = avgWaitTime[0]?.count || 0

    res.json({
      success: true,
      data: result
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Bump order (mark item as started)
 * @route   POST /api/kitchen/orders/:id/bump
 * @access  Private (Kitchen)
 */
export const bumpOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Auto-transition: CONFIRMED -> COOKING -> READY
    let newStatus = order.status
    
    if (order.status === 'CONFIRMED') {
      newStatus = 'COOKING'
    } else if (order.status === 'COOKING') {
      newStatus = 'READY'
    } else {
      return res.status(400).json({
        success: false,
        error: `Cannot bump order with status: ${order.status}`
      })
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status: newStatus } },
      { new: true }
    )
    .select('order_number status table_id')
    .populate('table_id', 'number')

    res.json({
      success: true,
      data: updatedOrder,
      message: `Order bumped to ${newStatus}`
    })

  } catch (error) {
    next(error)
  }
}
