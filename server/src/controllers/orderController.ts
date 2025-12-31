import { Request, Response, NextFunction } from 'express'
import { Order } from '../models/Order'
import { Table } from '../models/Table'
import { 
  createOrder, 
  createOrderNoTransaction,
  updateOrderStatus, 
  processPayment,
  voidOrder 
} from '../services/orderService'
import { emitNewOrder, emitOrderStatusUpdate } from '../config/socket'
import mongoose from 'mongoose'

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Public (WEB) / Private (POS)
 */
export const createOrderHandler = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { 
      order_source, 
      table_id, 
      guest_info, 
      items, 
      notes,
      apply_service_charge 
    } = req.body

    // Validate required fields
    if (!order_source || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'order_source and items are required'
      })
    }

    // Validate order source
    if (!['POS', 'WEB'].includes(order_source)) {
      return res.status(400).json({
        success: false,
        error: 'order_source must be POS or WEB'
      })
    }

    // WEB orders require guest_info
    if (order_source === 'WEB' && !guest_info) {
      return res.status(400).json({
        success: false,
        error: 'guest_info is required for WEB orders'
      })
    }

    // Get user_id from auth middleware (POS orders)
    const user_id = (req as any).user?.id

    // Try transaction-based creation first, fallback to non-transaction
    let order
    try {
      order = await createOrder({
        order_source,
        table_id,
        user_id,
        guest_info,
        items,
        notes,
        apply_service_charge
      })
    } catch (txError: any) {
      // If transaction fails (no replica set), use fallback
      if (txError.message?.includes('Transaction') || txError.code === 20) {
        console.log('Transaction not supported, using fallback method')
        order = await createOrderNoTransaction({
          order_source,
          table_id,
          user_id,
          guest_info,
          items,
          notes,
          apply_service_charge
        })
      } else {
        throw txError
      }
    }

    // Populate table info for socket notification
    let tableInfo = null
    if (order.table_id) {
      tableInfo = await Table.findById(order.table_id).select('number name')
    }

    // 🔌 EMIT SOCKET EVENT - Notify staff of new order
    emitNewOrder({
      order_id: order._id.toString(),
      order_number: order.order_number,
      order_source: order.order_source,
      table_number: tableInfo?.number,
      table_name: tableInfo?.name,
      guest_name: order.guest_info?.name,
      items_count: order.items.length,
      total: order.financials.total,
      status: order.status,
      created_at: order.createdAt.toISOString()
    })

    res.status(201).json({
      success: true,
      data: order
    })

  } catch (error: any) {
    // Handle specific errors
    if (error.message?.includes('Insufficient stock')) {
      return res.status(400).json({
        success: false,
        error: error.message
      })
    }

    if (error.message?.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      })
    }

    next(error)
  }
}

/**
 * @desc    Get all orders with filters
 * @route   GET /api/orders
 * @access  Private (POS)
 */
export const getOrders = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { 
      status, 
      payment_status, 
      order_source,
      table_id,
      date_from,
      date_to,
      page = 1, 
      limit = 20 
    } = req.query

    // Build filter
    const filter: any = {}
    
    if (status) filter.status = status
    if (payment_status) filter.payment_status = payment_status
    if (order_source) filter.order_source = order_source
    if (table_id) filter.table_id = table_id
    
    if (date_from || date_to) {
      filter.createdAt = {}
      if (date_from) filter.createdAt.$gte = new Date(date_from as string)
      if (date_to) filter.createdAt.$lte = new Date(date_to as string)
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('table_id', 'number name')
        .populate('user_id', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ])

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private (POS) / Public (WEB - own order)
 */
export const getOrder = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table_id', 'number name')
      .populate('user_id', 'username')

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    res.json({
      success: true,
      data: order
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get order by order number (for customer tracking)
 * @route   GET /api/orders/track/:orderNumber
 * @access  Public
 */
export const trackOrder = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const order = await Order.findOne({ order_number: req.params.orderNumber })
      .select('order_number status items.name items.qty financials createdAt')

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    res.json({
      success: true,
      data: order
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update order status
 * @route   PATCH /api/orders/:id/status
 * @access  Private (POS)
 */
export const updateStatus = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { status } = req.body
    const validStatuses = ['PENDING', 'CONFIRMED', 'COOKING', 'READY', 'COMPLETED', 'CANCELLED']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      })
    }

    // Get previous status for notification
    const previousOrder = await Order.findById(req.params.id)
    const previousStatus = previousOrder?.status || 'UNKNOWN'

    const user_id = (req as any).user?.id
    const order = await updateOrderStatus(req.params.id, status, user_id)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // 🔌 EMIT SOCKET EVENT - Notify status change
    emitOrderStatusUpdate({
      order_id: order._id.toString(),
      order_number: order.order_number,
      status: order.status,
      previous_status: previousStatus,
      updated_at: new Date().toISOString()
    })

    res.json({
      success: true,
      data: order
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Process payment
 * @route   POST /api/orders/:id/pay
 * @access  Private (POS)
 */
export const payOrder = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { payment_method, amount } = req.body
    const validMethods = ['CASH', 'CARD', 'QRIS', 'TRANSFER']

    if (!validMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        error: `Invalid payment method. Must be one of: ${validMethods.join(', ')}`
      })
    }

    // Validate amount is provided
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid payment amount is required'
      })
    }

    const user_id = (req as any).user?.id
    const { order, transaction } = await processPayment(req.params.id, payment_method, amount, user_id)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    res.json({
      success: true,
      data: {
        order,
        transaction,
        change: amount - order.financials.total
      }
    })

  } catch (error: any) {
    if (error.message?.includes('Insufficient payment') || error.message?.includes('already paid')) {
      return res.status(400).json({
        success: false,
        error: error.message
      })
    }
    next(error)
  }
}

/**
 * @desc    Void order (cancel and restore stock)
 * @route   POST /api/orders/:id/void
 * @access  Private (POS - requires can_void permission)
 */
export const voidOrderHandler = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const user = (req as any).user

    // Check permission
    if (!user?.permissions?.can_void && user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to void orders'
      })
    }

    const order = await voidOrder(req.params.id, user.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or already cancelled'
      })
    }

    res.json({
      success: true,
      data: order,
      message: 'Order voided and stock restored'
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get active orders for kitchen display
 * @route   GET /api/orders/kitchen
 * @access  Private (POS)
 */
export const getKitchenOrders = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const orders = await Order.find({
      status: { $in: ['CONFIRMED', 'COOKING'] }
    })
    .select('order_number status items.name items.qty items.note table_id createdAt')
    .populate('table_id', 'number')
    .sort({ createdAt: 1 })

    res.json({
      success: true,
      data: orders
    })

  } catch (error) {
    next(error)
  }
}
