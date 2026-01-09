import axios, { type AxiosError, type AxiosInstance } from 'axios'

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Product type
export interface Product {
  _id: string
  name: string
  description?: string
  price: number
  stock: number
  category: string
  image_url?: string
  is_active: boolean
  branch_id?: string
  attributes?: {
    name: string
    options: { label: string; price_modifier: number }[]
  }[]
}

// Branch type
export interface Branch {
  _id: string
  name: string
  address: string
  phone: string
  is_active: boolean
}

// Table type
export interface Table {
  _id: string
  number: number
  name?: string
  capacity: number
  status: 'Available' | 'Occupied' | 'Reserved'
}

// Order type
export interface Order {
  _id: string
  order_number: string
  status: 'PENDING' | 'CONFIRMED' | 'COOKING' | 'READY' | 'COMPLETED' | 'CANCELLED'
  payment_status: 'UNPAID' | 'PAID'
  items: {
    product_id: string
    name: string
    qty: number
    price_at_moment: number
    note?: string
  }[]
  financials: {
    subtotal: number
    tax: number
    total: number
  }
  createdAt: string
}

// Reservation type
export interface Reservation {
  _id: string
  guest_name: string
  whatsapp: string
  date: string
  time: string
  pax: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  table_id?: Table
  notes?: string
}

// Create axios instance
const getBaseURL = () => {
  let envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  // Remove trailing slash if exists
  envUrl = envUrl.replace(/\/+$/, '')
  // Ensure URL ends with /api
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`
}

const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor - Global error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    const message = error.response?.data?.error || error.message
    console.error('API Error:', message)
    return Promise.reject(error)
  }
)

// Request interceptor - Debug logging & Branch ID injection
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    console.log('Request Data:', config.data)
    
    // 🔐 MULTI-TENANCY: Inject branch_id from localStorage
    const storedBranch = localStorage.getItem('selected_branch')
    if (storedBranch) {
      try {
        const branch = JSON.parse(storedBranch)
        if (branch._id) {
          // Add branch_id to query params
          config.params = {
            ...config.params,
            branch_id: branch._id
          }
        }
      } catch (e) {
        console.error('Failed to parse stored branch:', e)
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Export the api instance as default
export default api

// ============ PUBLIC API MODULES (No Auth Required) ============

/**
 * Products API - Public endpoints for menu display
 */
export const productsApi = {
  /**
   * Get all active products (for menu display)
   */
  getAll: async (params?: { category?: string; search?: string }) => {
    const response = await api.get<ApiResponse<Product[]>>('/products', { 
      params: { ...params, active_only: 'true' } 
    })
    return response.data
  },

  /**
   * Get product by ID
   */
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`)
    return response.data
  },

  /**
   * Get all categories
   */
  getCategories: async () => {
    const response = await api.get<ApiResponse<string[]>>('/products/categories')
    return response.data
  },
}

/**
 * Tables API - Public endpoints
 */
export const tablesApi = {
  /**
   * Get all tables
   */
  getAll: async (params?: { available_only?: boolean }) => {
    const response = await api.get<ApiResponse<Table[]>>('/tables', { 
      params: { available_only: params?.available_only ? 'true' : undefined } 
    })
    return response.data
  },

  /**
   * Reserve a table (public)
   */
  reserve: async (tableId: string, data: { 
    name: string
    whatsapp: string
    pax: number
    reservation_time: string 
  }) => {
    const response = await api.post<ApiResponse<Table>>(`/tables/${tableId}/reserve`, data)
    return response.data
  },
}

/**
 * Orders API - Public endpoints for customer ordering
 */
export const ordersApi = {
  /**
   * Create a new order (WEB order from customer app)
   */
  create: async (data: {
    table_id?: string
    guest_info: { name: string; whatsapp: string; pax: number }
    items: { product_id: string; qty: number; note?: string }[]
    notes?: string
  }) => {
    const response = await api.post<ApiResponse<Order>>('/orders', {
      ...data,
      order_source: 'WEB'
    })
    return response.data
  },

  /**
   * Track order by order number
   */
  track: async (orderNumber: string) => {
    const response = await api.get<ApiResponse<Order>>(`/orders/track/${orderNumber}`)
    return response.data
  },
}

/**
 * Reservations API - Public endpoints
 */
export const reservationsApi = {
  /**
   * Create a new reservation request
   */
  create: async (data: {
    guest_name: string
    whatsapp: string
    email?: string
    date: string
    time: string
    pax: number
    notes?: string
  }) => {
    console.log('Sending reservation data:', data)
    const response = await api.post<ApiResponse<Reservation>>('/reservations', data)
    return response.data
  },

  /**
   * Check reservations by WhatsApp number
   */
  checkByPhone: async (whatsapp: string) => {
    const response = await api.get<ApiResponse<Reservation[]>>(`/reservations/check/${whatsapp}`)
    return response.data
  },
}

// ============ EXAMPLE USAGE IN REACT COMPONENT ============
/*
import { useEffect, useState } from 'react'
import { productsApi, Product } from '@/lib/api'

function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.getAll()
        if (response.success && response.data) {
          setProducts(response.data)
        }
      } catch (err) {
        setError('Failed to load menu')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div>
      {products.map(product => (
        <div key={product._id}>
          <h3>{product.name}</h3>
          <p>Rp {product.price.toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}
*/
