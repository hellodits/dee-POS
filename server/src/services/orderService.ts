import mongoose, { ClientSession } from 'mongoose'
import { Order, IOrder, IOrderItem, OrderSource, PaymentMethod } from '../models/Order'
import { Product } from '../models/Product'
import { Table } from '../models/Table'
import { InventoryLog } from '../models/InventoryLog'
import { Types } from 'mongoose'

// Tax rate (10%)
const TAX_RATE = 0.1
// Service charge (5%)
const SERVICE_CHARGE_RATE = 0.05

/**
 * Generate unique order number
 */
async function generateOrderNumber(orderSource: OrderSource): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const prefix = orderSource === 'POS' ? 'POS' : 'WEB'
  
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)
  
  const count = await Order.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  })
  
  return `${prefix}-${dateStr}-${String(count + 1).padStart(4, '0')}`
}

interface CreateOrderInput {
  order_source: OrderSource
  table_id?: string
  user_id?: string
  guest_info?: {
    name: string
    whatsapp: string
    pax: number
  }
  items: {
    product_id: string
    qty: number
    note?: string
    attributes?: {
      name: string
      selected: string
      price_modifier: number
    }[]
  }[]
  notes?: string
  apply_service_charge?: boolean
}

interface StockDeductionResult {
  success: boolean
  deducted_items: { product_id: string; qty: number; name: string }[]
  failed_item?: { product_id: string; name: string; requested: number; available: number }
}

/**
 * ATOMIC STOCK DEDUCTION
 * Uses findOneAndUpdate with stock condition to prevent overselling
 * This is the core concurrency-safe pattern for inventory management
 */
async function atomicStockDeduction(
  items: CreateOrderInput['items'],
  session?: ClientSession
): Promise<StockDeductionResult> {
  const deducted_items: { product_id: string; qty: number; name: string }[] = []

  for (const item of items) {
    // Atomic check-and-deduct: Only succeeds if stock >= requested qty
    const result = await Product.findOneAndUpdate(
      { 
        _id: item.product_id, 
        stock: { $gte: item.qty } // Condition: sufficient stock
      },
      { 
        $inc: { stock: -item.qty } // Atomic decrement
      },
      { 
        new: true, // Return updated document
        session 
      }
    )

    if (!result) {
      // Deduction failed - either product not found or insufficient stock
      const product = await Product.findById(item.product_id).session(session || null)
      
      // ROLLBACK: Restore previously deducted items
      for (const deducted of deducted_items) {
        await Product.findByIdAndUpdate(
          deducted.product_id,
          { $inc: { stock: deducted.qty } },
          { session }
        )
      }

      return {
        success: false,
        deducted_items: [],
        failed_item: {
          product_id: item.product_id,
          name: product?.name || 'Unknown Product',
          requested: item.qty,
          available: product?.stock || 0
        }
      }
    }

    deducted_items.push({
      product_id: item.product_id,
      qty: item.qty,
      name: result.name
    })
  }

  return { success: true, deducted_items }
}

/**
 * CREATE ORDER with Atomic Stock Deduction
 * Handles concurrency using MongoDB's atomic operations
 * Note: Inventory logs are created outside transaction (time-series limitation)
 */
export async function createOrder(input: CreateOrderInput): Promise<IOrder> {
  // Use transaction for data consistency (requires replica set)
  const session = await mongoose.startSession()
  let order: IOrder
  let stockResult: StockDeductionResult
  let productMap: Map<string, any>
  
  try {
    session.startTransaction()

    // 1. Validate and fetch products
    const productIds = input.items.map(item => new Types.ObjectId(item.product_id))
    const products = await Product.find({ 
      _id: { $in: productIds },
      is_active: true 
    }).session(session)

    if (products.length !== input.items.length) {
      throw new Error('One or more products not found or inactive')
    }

    // Create product lookup map
    productMap = new Map(products.map(p => [p._id.toString(), p]))

    // 2. ATOMIC STOCK DEDUCTION - Prevents race conditions
    stockResult = await atomicStockDeduction(input.items, session)
    
    if (!stockResult.success) {
      throw new Error(
        `Insufficient stock for "${stockResult.failed_item?.name}". ` +
        `Requested: ${stockResult.failed_item?.requested}, ` +
        `Available: ${stockResult.failed_item?.available}`
      )
    }

    // 3. Build order items with snapshot data
    const orderItems: IOrderItem[] = input.items.map(item => {
      const product = productMap.get(item.product_id)!
      const attributeTotal = item.attributes?.reduce((sum, attr) => sum + attr.price_modifier, 0) || 0
      
      return {
        product_id: new Types.ObjectId(item.product_id),
        name: product.name, // Snapshot
        qty: item.qty,
        price_at_moment: product.price + attributeTotal, // Snapshot with modifiers
        note: item.note,
        attributes: item.attributes
      }
    })

    // 4. Calculate financials
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price_at_moment * item.qty), 0)
    const tax = Math.round(subtotal * TAX_RATE)
    const service_charge = input.apply_service_charge ? Math.round(subtotal * SERVICE_CHARGE_RATE) : 0
    const total = subtotal + tax + service_charge

    // 5. Generate order number and create order
    const order_number = await generateOrderNumber(input.order_source)
    
    order = new Order({
      order_number,
      order_source: input.order_source,
      status: 'PENDING',
      payment_status: 'UNPAID',
      table_id: input.table_id ? new Types.ObjectId(input.table_id) : undefined,
      user_id: input.user_id ? new Types.ObjectId(input.user_id) : undefined,
      guest_info: input.guest_info,
      items: orderItems,
      financials: {
        subtotal,
        discount: 0,
        tax,
        service_charge,
        total
      },
      notes: input.notes
    })

    await order.save({ session })

    // 6. Update table status if table order
    if (input.table_id) {
      await Table.findByIdAndUpdate(
        input.table_id,
        { 
          status: 'Occupied',
          current_order_id: order._id
        },
        { session }
      )
    }

    await session.commitTransaction()

  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }

  // 7. Create inventory logs OUTSIDE transaction (time-series collections don't support transactions)
  try {
    const inventoryLogs = stockResult.deducted_items.map(item => {
      const product = productMap.get(item.product_id)!
      return {
        product_id: new Types.ObjectId(item.product_id),
        product_name: item.name,
        qty_change: -item.qty,
        qty_before: product.stock + item.qty,
        qty_after: product.stock,
        reason: 'ORDER' as const,
        reference_id: order._id,
        user_id: input.user_id ? new Types.ObjectId(input.user_id) : undefined,
        timestamp: new Date()
      }
    })
    await InventoryLog.insertMany(inventoryLogs)
  } catch (logError) {
    console.error('Failed to create inventory logs:', logError)
    // Don't fail the order if logging fails
  }
  
  return order
}

/**
 * FALLBACK: Create Order without Transaction
 * For MongoDB instances without replica set support
 */
export async function createOrderNoTransaction(input: CreateOrderInput): Promise<IOrder> {
  // 1. Validate products
  const productIds = input.items.map(item => new Types.ObjectId(item.product_id))
  const products = await Product.find({ 
    _id: { $in: productIds },
    is_active: true 
  })

  if (products.length !== input.items.length) {
    throw new Error('One or more products not found or inactive')
  }

  const productMap = new Map(products.map(p => [p._id.toString(), p]))

  // 2. ATOMIC STOCK DEDUCTION (still atomic per-item)
  const stockResult = await atomicStockDeduction(input.items)
  
  if (!stockResult.success) {
    throw new Error(
      `Insufficient stock for "${stockResult.failed_item?.name}". ` +
      `Requested: ${stockResult.failed_item?.requested}, ` +
      `Available: ${stockResult.failed_item?.available}`
    )
  }

  // 3. Build order items
  const orderItems: IOrderItem[] = input.items.map(item => {
    const product = productMap.get(item.product_id)!
    const attributeTotal = item.attributes?.reduce((sum, attr) => sum + attr.price_modifier, 0) || 0
    
    return {
      product_id: new Types.ObjectId(item.product_id),
      name: product.name,
      qty: item.qty,
      price_at_moment: product.price + attributeTotal,
      note: item.note,
      attributes: item.attributes
    }
  })

  // 4. Calculate financials
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price_at_moment * item.qty), 0)
  const tax = Math.round(subtotal * TAX_RATE)
  const service_charge = input.apply_service_charge ? Math.round(subtotal * SERVICE_CHARGE_RATE) : 0
  const total = subtotal + tax + service_charge

  // 5. Generate order number and create order
  const order_number = await generateOrderNumber(input.order_source)
  
  const order = new Order({
    order_number,
    order_source: input.order_source,
    status: 'PENDING',
    payment_status: 'UNPAID',
    table_id: input.table_id ? new Types.ObjectId(input.table_id) : undefined,
    user_id: input.user_id ? new Types.ObjectId(input.user_id) : undefined,
    guest_info: input.guest_info,
    items: orderItems,
    financials: { subtotal, discount: 0, tax, service_charge, total },
    notes: input.notes
  })

  await order.save()

  // 6. Update table if needed
  if (input.table_id) {
    await Table.findByIdAndUpdate(input.table_id, { 
      status: 'Occupied',
      current_order_id: order._id
    })
  }

  return order
}

/**
 * Update Order Status
 */
export async function updateOrderStatus(
  orderId: string, 
  status: IOrder['status'],
  userId?: string
): Promise<IOrder | null> {
  const updateData: any = { status }
  
  if (status === 'COMPLETED') {
    updateData.completed_at = new Date()
  }

  const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true })

  // Release table if order completed/cancelled
  if (order && (status === 'COMPLETED' || status === 'CANCELLED') && order.table_id) {
    await Table.findByIdAndUpdate(order.table_id, {
      status: 'Available',
      current_order_id: null
    })
  }

  return order
}

/**
 * Process Payment
 */
export async function processPayment(
  orderId: string,
  paymentMethod: PaymentMethod,
  userId?: string
): Promise<IOrder | null> {
  return Order.findByIdAndUpdate(
    orderId,
    {
      payment_status: 'PAID',
      payment_method: paymentMethod
    },
    { new: true }
  )
}

/**
 * Void Order - Restore stock
 */
export async function voidOrder(orderId: string, userId: string): Promise<IOrder | null> {
  const order = await Order.findById(orderId)
  if (!order || order.status === 'CANCELLED') return null

  // Restore stock for each item
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product_id, {
      $inc: { stock: item.qty }
    })

    // Log inventory restoration
    const product = await Product.findById(item.product_id)
    if (product) {
      await InventoryLog.create({
        product_id: item.product_id,
        product_name: item.name,
        qty_change: item.qty,
        qty_before: product.stock - item.qty,
        qty_after: product.stock,
        reason: 'RETURN',
        reference_id: order._id,
        user_id: new Types.ObjectId(userId),
        timestamp: new Date()
      })
    }
  }

  // Update order status
  order.status = 'CANCELLED'
  if (order.payment_status === 'PAID') {
    order.payment_status = 'REFUNDED'
  }
  await order.save()

  // Release table
  if (order.table_id) {
    await Table.findByIdAndUpdate(order.table_id, {
      status: 'Available',
      current_order_id: null
    })
  }

  return order
}
