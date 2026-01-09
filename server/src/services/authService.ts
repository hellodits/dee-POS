import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

interface RegisterData {
  username: string
  email: string
  password: string
  role?: 'owner' | 'admin' | 'manager' | 'cashier'
  branch_id?: string
}

interface LoginData {
  email: string
  password: string
}

interface AuthResponse {
  user: any
  token: string
}

// JWT Payload with branch context
interface JWTPayload {
  id: string
  role: string
  branch_id: string | null
}

// Mock user storage for when database is not available
let mockUsers: any[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@deepos.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    permissions: {
      can_void: true,
      can_discount: true,
      can_see_report: true,
      can_manage_inventory: true,
      can_manage_users: true,
      can_manage_tables: true
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export class AuthService {
  private isDatabaseConnected(): boolean {
    return mongoose.connection.readyState === 1
  }

  /**
   * Generate JWT token with user id, role, and branch_id
   * This enables multi-tenancy security at the token level
   */
  private generateToken(userId: string, role: string, branchId: string | null): string {
    const secret = process.env.JWT_SECRET || 'fallback-secret'
    const options = { expiresIn: process.env.JWT_EXPIRE || '30d' } as any
    
    const payload: JWTPayload = {
      id: userId,
      role: role,
      branch_id: branchId
    }
    
    return jwt.sign(payload, secret, options)
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const { username, email, password, role = 'cashier', branch_id } = data

    if (this.isDatabaseConnected()) {
      // Use real database
      try {
        const { User } = await import('../models/User')
        
        const existingUser = await User.findOne({ $or: [{ email }, { username }] })
        if (existingUser) {
          throw new Error('User already exists with this email or username')
        }

        // Validate branch_id for non-owner roles
        if (role !== 'owner' && !branch_id) {
          throw new Error('branch_id is required for non-owner roles')
        }

        const user = await User.create({
          username,
          email,
          password,
          role,
          branch_id: role === 'owner' ? undefined : branch_id
        })

        // Generate token with role and branch_id
        const token = this.generateToken(
          user._id.toString(),
          user.role,
          user.branch_id?.toString() || null
        )

        return {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            branch_id: user.branch_id,
            permissions: user.permissions,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          token
        }
      } catch (error: any) {
        // Re-throw validation errors
        if (error.message.includes('branch_id') || error.message.includes('already exists')) {
          throw error
        }
        console.log('Database operation failed, falling back to mock storage')
      }
    }

    // Use mock storage (fallback or when database not connected)
    const existingUser = mockUsers.find(user => user.email === email || user.username === username)
    if (existingUser) {
      throw new Error('User already exists with this email or username')
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = {
      id: (mockUsers.length + 1).toString(),
      username,
      email,
      password: hashedPassword,
      role,
      branch_id: role === 'owner' ? null : branch_id,
      permissions: {
        can_void: false,
        can_discount: false,
        can_see_report: false,
        can_manage_inventory: false,
        can_manage_users: false,
        can_manage_tables: false
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    mockUsers.push(newUser)
    const token = this.generateToken(newUser.id, newUser.role, newUser.branch_id ?? null)

    const { password: _, ...userWithoutPassword } = newUser

    return {
      user: userWithoutPassword,
      token
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data

    if (this.isDatabaseConnected()) {
      // Use real database
      try {
        const { User } = await import('../models/User')
        
        // Support login by email OR username
        const user = await User.findOne({
          $or: [
            { email: email.toLowerCase() },
            { username: email } // 'email' field can also be username
          ]
        }).select('+password')

        if (!user) {
          throw new Error('Invalid credentials')
        }

        const isMatch = await user.matchPassword(password)
        if (!isMatch) {
          throw new Error('Invalid credentials')
        }

        if (!user.isActive) {
          throw new Error('Account is deactivated')
        }

        user.lastLogin = new Date()
        await user.save()

        // Generate token with role and branch_id for multi-tenancy
        const token = this.generateToken(
          user._id.toString(),
          user.role,
          user.branch_id?.toString() ?? null
        )

        return {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            branch_id: user.branch_id,
            permissions: user.permissions,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          token
        }
      } catch (error: any) {
        // Re-throw auth errors, don't fallback
        if (error.message === 'Invalid credentials' || error.message === 'Account is deactivated') {
          throw error
        }
        console.log('Database operation failed, falling back to mock storage')
      }
    }

    // Use mock storage (fallback or when database not connected)
    const user = mockUsers.find(u => u.email === email || u.username === email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new Error('Invalid credentials')
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated')
    }

    user.lastLogin = new Date()
    user.updatedAt = new Date()

    // Generate token with role and branch_id
    const token = this.generateToken(user.id, user.role, user.branch_id)
    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token
    }
  }

  async getMe(userId: string): Promise<any> {
    if (this.isDatabaseConnected()) {
      try {
        const { User } = await import('../models/User')
        
        const user = await User.findById(userId).populate('branch_id', 'name address phone')
        if (!user) {
          throw new Error('User not found')
        }

        return {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
          avatar: user.avatar,
          role: user.role,
          branch_id: user.branch_id,
          permissions: user.permissions,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      } catch (error) {
        console.log('Database operation failed, falling back to mock storage')
      }
    }

    // Use mock storage (fallback or when database not connected)
    const user = mockUsers.find(u => u.id === userId)
    if (!user) {
      throw new Error('User not found')
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  async updateProfile(userId: string, data: {
    firstName?: string
    lastName?: string
    email?: string
    address?: string
    avatar?: string
    password?: string
  }): Promise<any> {
    if (this.isDatabaseConnected()) {
      try {
        const { User } = await import('../models/User')
        
        const user = await User.findById(userId).select('+password')
        if (!user) {
          throw new Error('User not found')
        }

        // Update fields
        if (data.firstName !== undefined) user.firstName = data.firstName
        if (data.lastName !== undefined) user.lastName = data.lastName
        if (data.email !== undefined) user.email = data.email
        if (data.address !== undefined) user.address = data.address
        if (data.avatar !== undefined) user.avatar = data.avatar
        if (data.password) user.password = data.password // Will be hashed by pre-save hook

        await user.save()

        return {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
          avatar: user.avatar,
          role: user.role,
          permissions: user.permissions,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      } catch (error: any) {
        throw error
      }
    }

    // Use mock storage (fallback)
    const userIndex = mockUsers.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      throw new Error('User not found')
    }

    const user = mockUsers[userIndex]
    if (data.firstName !== undefined) user.firstName = data.firstName
    if (data.lastName !== undefined) user.lastName = data.lastName
    if (data.email !== undefined) user.email = data.email
    if (data.address !== undefined) user.address = data.address
    if (data.avatar !== undefined) user.avatar = data.avatar
    if (data.password) {
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(data.password, salt)
    }
    user.updatedAt = new Date()

    mockUsers[userIndex] = user

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  async forgotPassword(email: string): Promise<void> {
    if (this.isDatabaseConnected()) {
      try {
        const { User } = await import('../models/User')
        
        const user = await User.findOne({ email })
        if (!user) {
          throw new Error('User not found with this email')
        }
      } catch (error) {
        console.log('Database operation failed, checking mock storage')
      }
    }

    // Check mock storage
    const user = mockUsers.find(u => u.email === email)
    if (!user) {
      throw new Error('User not found with this email')
    }

    console.log(`Password reset requested for: ${email}`)
  }
}