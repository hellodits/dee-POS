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
    lastLogin?: string
  }
  token: string
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
  
  pay: (id: string, payment_method: 'CASH' | 'CARD' | 'QRIS' | 'TRANSFER') => 
    api.post<ApiResponse>(`/orders/${id}/pay`, { payment_method }),
  
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
  
  getTopProducts: (params?: { period?: string; limit?: number }) => 
    api.get<ApiResponse>('/reports/top-products', { params }),
  
  getDailyTrend: (params?: { period?: string }) => 
    api.get<ApiResponse>('/reports/daily-trend', { params }),
  
  getLowStock: (threshold?: number) => 
    api.get<ApiResponse>('/reports/low-stock', { params: { threshold } }),
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
  
  create: (data: {
    name: string;
    description?: string;
    category: string;
    unit: string;
    current_stock: number;
    min_stock: number;
    max_stock?: number;
    cost_per_unit: number;
    supplier?: string;
    supplier_contact?: string;
    expiry_date?: string;
    is_perishable: boolean;
    storage_location?: string;
    image_url?: string;
  }) => api.post<ApiResponse>('/inventory', data),
  
  update: (id: string, data: Partial<{
    name: string;
    description?: string;
    category: string;
    unit: string;
    min_stock: number;
    max_stock?: number;
    cost_per_unit: number;
    supplier?: string;
    supplier_contact?: string;
    expiry_date?: string;
    is_perishable: boolean;
    storage_location?: string;
    image_url?: string;
  }>) => api.put<ApiResponse>(`/inventory/${id}`, data),
  
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
  
  checkByPhone: (whatsapp: string) => 
    api.get<ApiResponse>(`/reservations/check/${whatsapp}`),
}
