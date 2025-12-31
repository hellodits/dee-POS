import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

// Storage keys
const TOKEN_KEY = 'access_token'
const USER_KEY = 'user'

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

export interface AuthResponse {
  user: {
    id: string
    username: string
    email: string
    firstName?: string
    lastName?: string
    address?: string
    avatar?: string
    role: 'admin' | 'manager' | 'cashier'
    permissions: {
      can_void: boolean
      can_discount: boolean
      can_see_report: boolean
      can_manage_inventory: boolean
      can_manage_users: boolean
      can_manage_tables: boolean
    }
    isActive: boolean
    createdAt?: string
    lastLogin?: string
  }
  token: string
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

// Request interceptor - Auto-attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY)
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // If sending FormData, let axios set the Content-Type automatically
    // This is important for multipart/form-data with proper boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Global error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    const status = error.response?.status
    const message = error.response?.data?.error || error.message

    // Handle 401 Unauthorized - Auto redirect to login
    if (status === 401) {
      // Clear stored auth data
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      
      // Redirect to login (avoid redirect loop)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      console.error('Access denied:', message)
    }

    // Handle 500 Server Error
    if (status && status >= 500) {
      console.error('Server error:', message)
    }

    return Promise.reject(error)
  }
)

// Auth helper functions
export const auth = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password })
    const data = response.data.data!
    
    // Store token and user
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    
    return data
  },

  register: async (data: { username: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    const result = response.data.data!
    
    // Store token and user after registration
    localStorage.setItem(TOKEN_KEY, result.token)
    localStorage.setItem(USER_KEY, JSON.stringify(result.user))
    
    return result
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    window.location.href = '/login'
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
  },

  getUser: (): AuthResponse['user'] | null => {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY)
  },

  hasRole: (...roles: string[]): boolean => {
    const user = auth.getUser()
    return user ? roles.includes(user.role) : false
  },

  hasPermission: (permission: keyof AuthResponse['user']['permissions']): boolean => {
    const user = auth.getUser()
    if (!user) return false
    if (user.role === 'admin') return true
    return user.permissions?.[permission] ?? false
  },

  getMe: async (): Promise<AuthResponse['user'] | null> => {
    const response = await api.get<ApiResponse<AuthResponse['user']>>('/auth/me')
    return response.data.data || null
  },

  updateProfile: async (data: FormData): Promise<ApiResponse<AuthResponse['user']>> => {
    const response = await api.put<ApiResponse<AuthResponse['user']>>('/auth/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    // Update stored user data
    if (response.data.data) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.data))
    }
    return response.data
  }
}

// Export the api instance as default
export default api

// Named exports for specific API modules
export const productsApi = {
  getAll: (params?: { category?: string; search?: string; active_only?: string }) => 
    api.get<ApiResponse>('/products', { params }),
  
  getAllForPOS: () => 
    api.get<ApiResponse>('/products/pos/all'),
  
  getById: (id: string) => 
    api.get<ApiResponse>(`/products/${id}`),
  
  getCategories: () => 
    api.get<ApiResponse<string[]>>('/products/categories'),
  
  create: (data: FormData) => 
    api.post<ApiResponse>('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  update: (id: string, data: FormData) => 
    api.put<ApiResponse>(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  delete: (id: string) => 
    api.delete<ApiResponse>(`/products/${id}`),
  
  updateStock: (id: string, data: { qty_change: number; reason: string; notes?: string }) => 
    api.post<ApiResponse>(`/products/${id}/stock`, data),
}

export const ordersApi = {
  getAll: (params?: { status?: string; payment_status?: string; page?: number }) => 
    api.get<ApiResponse>('/orders', { params }),
  
  getById: (id: string) => 
    api.get<ApiResponse>(`/orders/${id}`),
  
  create: (data: {
    order_source: 'POS' | 'WEB'
    table_id?: string
    guest_info?: { name: string; whatsapp: string; pax: number }
    items: { product_id: string; qty: number; note?: string }[]
    notes?: string
    apply_service_charge?: boolean
  }) => api.post<ApiResponse>('/orders', data),
  
  updateStatus: (id: string, status: string) => 
    api.patch<ApiResponse>(`/orders/${id}/status`, { status }),
  
  pay: (id: string, payment_method: 'CASH' | 'CARD' | 'QRIS' | 'TRANSFER', amount: number) => 
    api.post<ApiResponse>(`/orders/${id}/pay`, { payment_method, amount }),
  
  void: (id: string) => 
    api.post<ApiResponse>(`/orders/${id}/void`),
  
  track: (orderNumber: string) => 
    api.get<ApiResponse>(`/orders/track/${orderNumber}`),
}

export const tablesApi = {
  getAll: (params?: { status?: string; available_only?: string }) => 
    api.get<ApiResponse>('/tables', { params }),
  
  getById: (id: string) => 
    api.get<ApiResponse>(`/tables/${id}`),
  
  getSummary: () => 
    api.get<ApiResponse>('/tables/summary'),
  
  create: (data: { number: number; name?: string; capacity: number }) => 
    api.post<ApiResponse>('/tables', data),
  
  update: (id: string, data: Partial<{ number: number; name: string; capacity: number; status: string }>) => 
    api.put<ApiResponse>(`/tables/${id}`, data),
  
  delete: (id: string) => 
    api.delete<ApiResponse>(`/tables/${id}`),
  
  reserve: (id: string, data: { name: string; whatsapp: string; pax: number; reservation_time: string }) => 
    api.post<ApiResponse>(`/tables/${id}/reserve`, data),
  
  release: (id: string) => 
    api.post<ApiResponse>(`/tables/${id}/release`),
  
  reset: (id: string, force?: boolean) => 
    api.patch<ApiResponse>(`/tables/${id}/reset`, { force }),
}

export const kitchenApi = {
  getOrders: () => 
    api.get<ApiResponse>('/kitchen/orders'),
  
  getStats: () => 
    api.get<ApiResponse>('/kitchen/stats'),
  
  updateStatus: (id: string, status: 'COOKING' | 'READY') => 
    api.patch<ApiResponse>(`/kitchen/orders/${id}/status`, { status }),
  
  bump: (id: string) => 
    api.post<ApiResponse>(`/kitchen/orders/${id}/bump`),
}

export const reportsApi = {
  getDashboard: () => 
    api.get<ApiResponse>('/reports/dashboard'),
  
  getSales: (params?: { period?: string; date_from?: string; date_to?: string }) => 
    api.get<ApiResponse>('/reports/sales', { params }),
  
  getTopProducts: (params?: { period?: string; limit?: number; date_from?: string; date_to?: string }) => 
    api.get<ApiResponse>('/reports/top-products', { params }),
  
  getDailyTrend: (params?: { period?: string; date_from?: string; date_to?: string }) => 
    api.get<ApiResponse>('/reports/daily-trend', { params }),
  
  getLowStock: (threshold?: number) => 
    api.get<ApiResponse>('/reports/low-stock', { params: { threshold } }),
  
  getTransactions: (params?: { period?: string; date_from?: string; date_to?: string }) => 
    api.get<ApiResponse>('/reports/transactions', { params }),
  
  getCashiers: (params?: { period?: string; date_from?: string; date_to?: string }) => 
    api.get<ApiResponse>('/reports/cashiers', { params }),
  
  getReservations: (params?: { period?: string; date_from?: string; date_to?: string }) => 
    api.get<ApiResponse>('/reports/reservations', { params }),
  
  getStaff: (params?: { period?: string; date_from?: string; date_to?: string }) => 
    api.get<ApiResponse>('/reports/staff', { params }),
  
  getRevenueChart: (params?: { period?: string; date_from?: string; date_to?: string }) => 
    api.get<ApiResponse>('/reports/revenue-chart', { params }),
  
  getReservationChart: (params?: { period?: string; date_from?: string; date_to?: string }) => 
    api.get<ApiResponse>('/reports/reservation-chart', { params }),
  
  // Export functions
  exportOrders: (params?: { date_from?: string; date_to?: string; status?: string; payment_status?: string; order_source?: string }) => 
    api.get<ApiResponse>('/reports/export-orders', { params }),
}

export const inventoryApi = {
  getAll: (params?: { category?: string; search?: string; active_only?: string; low_stock_only?: string; expiring_soon?: string; page?: number; limit?: number }) => 
    api.get<ApiResponse>('/inventory', { params }),
  
  getById: (id: string) => 
    api.get<ApiResponse>(`/inventory/${id}`),
  
  getCategories: () => 
    api.get<ApiResponse<string[]>>('/inventory/categories'),
  
  getLowStock: (threshold?: number) => 
    api.get<ApiResponse>('/inventory/low-stock', { params: { threshold } }),
  
  getExpiring: (days?: number) => 
    api.get<ApiResponse>('/inventory/expiring', { params: { days } }),
  
  create: (data: FormData) => 
    api.post<ApiResponse>('/inventory', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  update: (id: string, data: FormData) => 
    api.put<ApiResponse>(`/inventory/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  delete: (id: string) => 
    api.delete<ApiResponse>(`/inventory/${id}`),
  
  adjustStock: (id: string, data: { qty_change: number; reason: string; notes?: string; cost_per_unit?: number }) => 
    api.post<ApiResponse>(`/inventory/${id}/adjust`, data),
}

export const reservationsApi = {
  getAll: (params?: { status?: string; date?: string; page?: number }) => 
    api.get<ApiResponse>('/reservations', { params }),
  
  getToday: () => 
    api.get<ApiResponse>('/reservations/today'),
  
  getById: (id: string) => 
    api.get<ApiResponse>(`/reservations/${id}`),
  
  create: (data: { guest_name: string; whatsapp: string; date: string; time: string; pax: number; notes?: string }) => 
    api.post<ApiResponse>('/reservations', data),
  
  approve: (id: string, data: { table_id?: string; admin_notes?: string }) => 
    api.patch<ApiResponse>(`/reservations/${id}/approve`, data),
  
  reject: (id: string, admin_notes?: string) => 
    api.patch<ApiResponse>(`/reservations/${id}/reject`, { admin_notes }),
  
  cancel: (id: string, admin_notes?: string) => 
    api.patch<ApiResponse>(`/reservations/${id}/cancel`, { admin_notes }),
  
  delete: (id: string) => 
    api.delete<ApiResponse>(`/reservations/${id}`),
  
  checkByPhone: (whatsapp: string) => 
    api.get<ApiResponse>(`/reservations/check/${whatsapp}`),
}

export const staffApi = {
  getAll: (params?: { role?: string; search?: string; active_only?: string; page?: number; limit?: number }) => 
    api.get<ApiResponse>('/staff', { params }),
  
  getById: (id: string) => 
    api.get<ApiResponse>(`/staff/${id}`),
  
  getRoles: () => 
    api.get<ApiResponse<string[]>>('/staff/roles'),
  
  create: (data: FormData) => 
    api.post<ApiResponse>('/staff', data),
  
  update: (id: string, data: FormData) => 
    api.put<ApiResponse>(`/staff/${id}`, data),
  
  delete: (id: string) => 
    api.delete<ApiResponse>(`/staff/${id}`),
  
  // Attendance
  getAttendance: (params?: { staff_id?: string; date?: string; date_from?: string; date_to?: string; status?: string; page?: number }) => 
    api.get<ApiResponse>('/staff/attendance', { params }),
  
  getTodayAttendance: () => 
    api.get<ApiResponse>('/staff/attendance/today'),
  
  createAttendance: (data: { staff_id: string; date: string; check_in?: string; check_out?: string; status: string; notes?: string }) => 
    api.post<ApiResponse>('/staff/attendance', data),
  
  updateAttendance: (id: string, data: Partial<{ check_in: string; check_out: string; status: string; notes: string }>) => 
    api.put<ApiResponse>(`/staff/attendance/${id}`, data),
  
  deleteAttendance: (id: string) => 
    api.delete<ApiResponse>(`/staff/attendance/${id}`),
  
  // Quick clock in/out
  clockIn: (staff_id: string) => 
    api.post<ApiResponse>('/staff/attendance/clock-in', { staff_id }),
  
  clockOut: (staff_id: string) => 
    api.post<ApiResponse>('/staff/attendance/clock-out', { staff_id }),
}

export const notificationsApi = {
  getAll: (params?: { page?: number; limit?: number; unread_only?: string }) => 
    api.get<ApiResponse>('/notifications', { params }),
  
  markAsRead: (id: string) => 
    api.patch<ApiResponse>(`/notifications/${id}/read`),
  
  markAllAsRead: () => 
    api.patch<ApiResponse>('/notifications/read-all'),
  
  delete: (id: string) => 
    api.delete<ApiResponse>(`/notifications/${id}`),
}

export const usersApi = {
  getAll: (params?: { role?: string; search?: string; active_only?: string; page?: number; limit?: number }) => 
    api.get<ApiResponse>('/users', { params }),
  
  getById: (id: string) => 
    api.get<ApiResponse>(`/users/${id}`),
  
  create: (data: { username: string; email: string; password: string; role: string; firstName?: string; lastName?: string }) => 
    api.post<ApiResponse>('/users', data),
  
  update: (id: string, data: Partial<{ username: string; email: string; password: string; role: string; firstName: string; lastName: string; isActive: boolean }>) => 
    api.put<ApiResponse>(`/users/${id}`, data),
  
  delete: (id: string) => 
    api.delete<ApiResponse>(`/users/${id}`),
  
  updatePermissions: (id: string, permissions: Record<string, boolean>) => 
    api.patch<ApiResponse>(`/users/${id}/permissions`, { permissions }),
}
