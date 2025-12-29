import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

interface MockUser {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'manager' | 'cashier'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
}

interface RegisterData {
  name: string
  email: string
  password: string
  role?: 'admin' | 'manager' | 'cashier'
}

interface LoginData {
  email: string
  password: string
}

interface AuthResponse {
  user: Omit<MockUser, 'password'>
  token: string
}

// In-memory user storage (for development only)
let mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@deepos.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export class MockAuthService {
  private generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET || 'fallback-secret'
    const options = { expiresIn: process.env.JWT_EXPIRE || '30d' } as any
    
    return jwt.sign({ id: userId }, secret, options)
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const { name, email, password, role = 'cashier' } = data

    // Check if user exists
    const existingUser = mockUsers.find(user => user.email === email)
    if (existingUser) {
      throw new Error('User already exists with this email')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const newUser: MockUser = {
      id: (mockUsers.length + 1).toString(),
      name,
      email,
      password: hashedPassword,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    mockUsers.push(newUser)

    // Generate token
    const token = this.generateToken(newUser.id)

    const { password: _, ...userWithoutPassword } = newUser

    return {
      user: userWithoutPassword,
      token
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data

    // Find user
    const user = mockUsers.find(u => u.email === email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new Error('Invalid credentials')
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated')
    }

    // Update last login
    user.lastLogin = new Date()
    user.updatedAt = new Date()

    // Generate token
    const token = this.generateToken(user.id)

    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token
    }
  }

  async getMe(userId: string): Promise<Omit<MockUser, 'password'>> {
    const user = mockUsers.find(u => u.id === userId)
    if (!user) {
      throw new Error('User not found')
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  async forgotPassword(email: string): Promise<void> {
    const user = mockUsers.find(u => u.email === email)
    if (!user) {
      throw new Error('User not found with this email')
    }

    console.log(`Password reset requested for: ${email}`)
  }
}