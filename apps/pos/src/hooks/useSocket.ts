import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { auth } from '@/lib/api'

// Socket event types
export interface OrderNotification {
  order_id: string
  order_number: string
  order_source: 'POS' | 'WEB'
  table_number?: number
  table_name?: string
  guest_name?: string
  items_count: number
  total: number
  status: string
  created_at: string
}

export interface OrderStatusUpdate {
  order_id: string
  order_number: string
  status: string
  previous_status: string
  updated_at: string
}

export interface KitchenUpdate {
  order_id: string
  order_number: string
  status: 'COOKING' | 'READY'
  table_number?: number
}

export interface ReservationNotification {
  reservation_id: string
  guest_name: string
  whatsapp: string
  date: string
  time: string
  pax: number
  status: string
}

export interface TableUpdate {
  table_id: string
  number: number
  status: string
}

interface UseSocketOptions {
  onNewOrder?: (order: OrderNotification) => void
  onOrderStatusUpdate?: (update: OrderStatusUpdate) => void
  onKitchenUpdate?: (update: KitchenUpdate) => void
  onNewReservation?: (reservation: ReservationNotification) => void
  onTableUpdate?: (table: TableUpdate) => void
  autoConnect?: boolean
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true } = options

  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastNotification, setLastNotification] = useState<OrderNotification | null>(null)
  
  // Store callbacks in refs to avoid reconnection loops
  const callbacksRef = useRef(options)
  callbacksRef.current = options

  // Initialize socket connection - only once
  useEffect(() => {
    if (!autoConnect || !auth.isAuthenticated()) return
    if (socketRef.current?.connected) return

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id)
      setIsConnected(true)

      // Join staff room with user role
      const user = auth.getUser()
      socket.emit('join:staff', { role: user?.role })
    })

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    // Business events - use refs to get latest callbacks
    socket.on('new_order_notification', (order: OrderNotification) => {
      console.log('📢 New order received:', order.order_number)
      setLastNotification(order)
      callbacksRef.current.onNewOrder?.(order)
    })

    socket.on('order_status_updated', (update: OrderStatusUpdate) => {
      console.log('📢 Order status updated:', update.order_number, '->', update.status)
      callbacksRef.current.onOrderStatusUpdate?.(update)
    })

    socket.on('kitchen_update', (update: KitchenUpdate) => {
      console.log('🍳 Kitchen update:', update.order_number, '->', update.status)
      callbacksRef.current.onKitchenUpdate?.(update)
    })

    socket.on('new_reservation_notification', (reservation: ReservationNotification) => {
      console.log('📢 New reservation:', reservation.guest_name)
      callbacksRef.current.onNewReservation?.(reservation)
    })

    socket.on('table_status_updated', (table: TableUpdate) => {
      console.log('🪑 Table updated:', table.number, '->', table.status)
      callbacksRef.current.onTableUpdate?.(table)
    })

    // Cleanup on unmount
    return () => {
      socket.emit('leave:staff')
      socket.disconnect()
      socketRef.current = null
    }
  }, [autoConnect]) // Only depend on autoConnect

  // Manual connect
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return
    socketRef.current?.connect()
  }, [])

  // Manual disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave:staff')
      socketRef.current.disconnect()
    }
  }, [])

  // Clear last notification
  const clearNotification = useCallback(() => {
    setLastNotification(null)
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    lastNotification,
    clearNotification
  }
}
