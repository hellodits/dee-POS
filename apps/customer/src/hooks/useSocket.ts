import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

// Socket event types
export interface OrderStatusUpdate {
  order_id: string
  order_number: string
  status: string
  previous_status: string
  updated_at: string
}

export interface OrderReady {
  order_id: string
  order_number: string
  status: 'READY'
  table_number?: number
}

interface UseOrderTrackingOptions {
  orderNumber: string
  onStatusUpdate?: (update: OrderStatusUpdate) => void
  onOrderReady?: (data: OrderReady) => void
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

/**
 * Hook for tracking order status in real-time (Customer App)
 */
export function useOrderTracking(options: UseOrderTrackingOptions) {
  const { orderNumber, onStatusUpdate, onOrderReady } = options

  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!orderNumber) return

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('🔌 Connected to track order:', orderNumber)
      setIsConnected(true)

      // Join customer room and track specific order
      socket.emit('join:customer', { order_number: orderNumber })
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    // Listen for status updates on this order
    socket.on('order_status_updated', (update: OrderStatusUpdate) => {
      if (update.order_number === orderNumber) {
        console.log('📢 Order status updated:', update.status)
        setCurrentStatus(update.status)
        onStatusUpdate?.(update)
      }
    })

    // Listen for order ready notification
    socket.on('order_ready', (data: OrderReady) => {
      if (data.order_number === orderNumber) {
        console.log('🔔 Your order is READY!')
        setCurrentStatus('READY')
        onOrderReady?.(data)
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [orderNumber, onStatusUpdate, onOrderReady])

  return {
    isConnected,
    currentStatus
  }
}

// ============ EXAMPLE USAGE ============
/*
import { useOrderTracking } from '@/hooks/useSocket'

function OrderTrackingPage({ orderNumber }: { orderNumber: string }) {
  const [status, setStatus] = useState('PENDING')

  const { isConnected, currentStatus } = useOrderTracking({
    orderNumber,
    onStatusUpdate: (update) => {
      setStatus(update.status)
    },
    onOrderReady: () => {
      // Show notification or play sound
      alert('Your order is ready for pickup!')
    }
  })

  return (
    <div>
      <h2>Order #{orderNumber}</h2>
      <p>Status: {currentStatus || status}</p>
      <p className="text-sm text-gray-500">
        {isConnected ? '🟢 Live tracking' : '🔴 Connecting...'}
      </p>
    </div>
  )
}
*/
