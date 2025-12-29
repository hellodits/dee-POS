// Global TypeScript types for the client application

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'cashier'
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}