/**
 * Database Seeding Script
 * 
 * Populates the database with initial data for development/production
 * 
 * Usage: npm run seed
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from '../models/User'
import { Product } from '../models/Product'
import { Table } from '../models/Table'

// Load environment variables
dotenv.config()

// ============ SEED DATA ============

// Default Users
const users = [
  {
    username: 'admin',
    email: 'admin@deepos.com',
    password: 'password123', // Will be hashed by User model pre-save hook
    role: 'admin' as const
  },
  {
    username: 'manager',
    email: 'manager@deepos.com',
    password: 'password123',
    role: 'manager' as const
  },
  {
    username: 'kasir1',
    email: 'kasir1@deepos.com',
    password: 'password123',
    role: 'cashier' as const
  },
  {
    username: 'kasir2',
    email: 'kasir2@deepos.com',
    password: 'password123',
    role: 'cashier' as const
  }
]

// Default Tables (T-01 to T-10)
const tables = [
  { number: 1, name: 'T-01', capacity: 2, status: 'Available' as const },
  { number: 2, name: 'T-02', capacity: 2, status: 'Available' as const },
  { number: 3, name: 'T-03', capacity: 4, status: 'Available' as const },
  { number: 4, name: 'T-04', capacity: 4, status: 'Available' as const },
  { number: 5, name: 'T-05', capacity: 4, status: 'Available' as const },
  { number: 6, name: 'T-06', capacity: 6, status: 'Available' as const },
  { number: 7, name: 'T-07', capacity: 6, status: 'Available' as const },
  { number: 8, name: 'T-08', capacity: 8, status: 'Available' as const },
  { number: 9, name: 'T-09', capacity: 8, status: 'Available' as const },
  { number: 10, name: 'T-10 VIP', capacity: 10, status: 'Available' as const }
]

// Default Products (Categories: Makanan, Minuman, Snack)
const products = [
  // ===== MAKANAN =====
  {
    name: 'Nasi Goreng Spesial',
    description: 'Nasi goreng dengan telur, ayam, dan sayuran segar',
    price: 35000,
    cost_price: 15000,
    stock: 100,
    category: 'Makanan',
    is_active: true,
    attributes: [
      {
        name: 'Level Pedas',
        options: [
          { label: 'Tidak Pedas', price_modifier: 0 },
          { label: 'Sedang', price_modifier: 0 },
          { label: 'Pedas', price_modifier: 0 },
          { label: 'Extra Pedas', price_modifier: 2000 }
        ]
      },
      {
        name: 'Tambahan',
        options: [
          { label: 'Telur Ceplok', price_modifier: 5000 },
          { label: 'Ayam Suwir', price_modifier: 8000 },
          { label: 'Sosis', price_modifier: 6000 }
        ]
      }
    ]
  },
  {
    name: 'Mie Goreng',
    description: 'Mie goreng dengan telur dan sayuran',
    price: 30000,
    cost_price: 12000,
    stock: 100,
    category: 'Makanan',
    is_active: true,
    attributes: [
      {
        name: 'Level Pedas',
        options: [
          { label: 'Tidak Pedas', price_modifier: 0 },
          { label: 'Pedas', price_modifier: 0 }
        ]
      }
    ]
  },
  {
    name: 'Ayam Bakar Madu',
    description: 'Ayam bakar dengan bumbu madu spesial, disajikan dengan nasi dan lalapan',
    price: 45000,
    cost_price: 22000,
    stock: 50,
    category: 'Makanan',
    is_active: true
  },
  {
    name: 'Sate Ayam',
    description: '10 tusuk sate ayam dengan bumbu kacang dan lontong',
    price: 40000,
    cost_price: 18000,
    stock: 80,
    category: 'Makanan',
    is_active: true
  },
  {
    name: 'Gado-Gado',
    description: 'Sayuran segar dengan bumbu kacang khas Indonesia',
    price: 25000,
    cost_price: 10000,
    stock: 60,
    category: 'Makanan',
    is_active: true
  },
  {
    name: 'Sop Buntut',
    description: 'Sop buntut sapi dengan kuah bening dan rempah pilihan',
    price: 65000,
    cost_price: 35000,
    stock: 30,
    category: 'Makanan',
    is_active: true
  },
  {
    name: 'Rendang Sapi',
    description: 'Rendang sapi empuk dengan bumbu rempah Padang',
    price: 55000,
    cost_price: 28000,
    stock: 40,
    category: 'Makanan',
    is_active: true
  },

  // ===== MINUMAN =====
  {
    name: 'Es Teh Manis',
    description: 'Teh manis dingin yang menyegarkan',
    price: 8000,
    cost_price: 2000,
    stock: 200,
    category: 'Minuman',
    is_active: true
  },
  {
    name: 'Es Jeruk',
    description: 'Jeruk peras segar dengan es',
    price: 12000,
    cost_price: 4000,
    stock: 150,
    category: 'Minuman',
    is_active: true
  },
  {
    name: 'Kopi Hitam',
    description: 'Kopi tubruk tradisional',
    price: 10000,
    cost_price: 3000,
    stock: 200,
    category: 'Minuman',
    is_active: true,
    attributes: [
      {
        name: 'Suhu',
        options: [
          { label: 'Panas', price_modifier: 0 },
          { label: 'Dingin', price_modifier: 2000 }
        ]
      }
    ]
  },
  {
    name: 'Jus Alpukat',
    description: 'Jus alpukat segar dengan susu coklat',
    price: 18000,
    cost_price: 8000,
    stock: 100,
    category: 'Minuman',
    is_active: true
  },
  {
    name: 'Jus Mangga',
    description: 'Jus mangga segar tanpa gula tambahan',
    price: 15000,
    cost_price: 6000,
    stock: 100,
    category: 'Minuman',
    is_active: true
  },
  {
    name: 'Air Mineral',
    description: 'Air mineral botol 600ml',
    price: 5000,
    cost_price: 2000,
    stock: 300,
    category: 'Minuman',
    is_active: true
  },

  // ===== SNACK =====
  {
    name: 'Kentang Goreng',
    description: 'French fries crispy dengan saus sambal dan mayonaise',
    price: 20000,
    cost_price: 8000,
    stock: 100,
    category: 'Snack',
    is_active: true,
    attributes: [
      {
        name: 'Ukuran',
        options: [
          { label: 'Regular', price_modifier: 0 },
          { label: 'Large', price_modifier: 8000 }
        ]
      }
    ]
  },
  {
    name: 'Pisang Goreng',
    description: 'Pisang goreng crispy dengan topping keju dan coklat',
    price: 15000,
    cost_price: 5000,
    stock: 80,
    category: 'Snack',
    is_active: true
  },
  {
    name: 'Tahu Crispy',
    description: 'Tahu goreng crispy dengan saus kacang',
    price: 12000,
    cost_price: 4000,
    stock: 100,
    category: 'Snack',
    is_active: true
  },
  {
    name: 'Cireng Isi',
    description: 'Cireng isi ayam dengan saus rujak',
    price: 15000,
    cost_price: 5000,
    stock: 80,
    category: 'Snack',
    is_active: true
  },
  {
    name: 'Roti Bakar',
    description: 'Roti bakar dengan berbagai pilihan topping',
    price: 18000,
    cost_price: 6000,
    stock: 60,
    category: 'Snack',
    is_active: true,
    attributes: [
      {
        name: 'Topping',
        options: [
          { label: 'Coklat', price_modifier: 0 },
          { label: 'Keju', price_modifier: 3000 },
          { label: 'Coklat Keju', price_modifier: 5000 },
          { label: 'Strawberry', price_modifier: 3000 }
        ]
      }
    ]
  }
]

// ============ SEED FUNCTION ============

async function seed() {
  console.log('🌱 Starting database seed...\n')

  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deepos'
    console.log('📡 Connecting to MongoDB...')
    await mongoose.connect(mongoURI)
    console.log('✅ Connected to MongoDB\n')

    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Table.deleteMany({})
    ])
    console.log('✅ Existing data cleared\n')

    // Seed Users
    console.log('👤 Seeding users...')
    const createdUsers = await User.create(users)
    console.log(`   ✅ Created ${createdUsers.length} users`)
    createdUsers.forEach(user => {
      console.log(`      - ${user.username} (${user.role})`)
    })
    console.log()

    // Seed Tables
    console.log('🪑 Seeding tables...')
    const createdTables = await Table.insertMany(tables)
    console.log(`   ✅ Created ${createdTables.length} tables (T-01 to T-10)\n`)

    // Seed Products
    console.log('🍽️  Seeding products...')
    const createdProducts = await Product.insertMany(products)
    
    // Count by category
    const categoryCount = createdProducts.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log(`   ✅ Created ${createdProducts.length} products`)
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`      - ${cat}: ${count} items`)
    })
    console.log()

    // Summary
    console.log('═'.repeat(50))
    console.log('🎉 SEED COMPLETED SUCCESSFULLY!')
    console.log('═'.repeat(50))
    console.log()
    console.log('📋 Summary:')
    console.log(`   • Users: ${createdUsers.length}`)
    console.log(`   • Tables: ${createdTables.length}`)
    console.log(`   • Products: ${createdProducts.length}`)
    console.log()
    console.log('🔐 Default Login Credentials:')
    console.log('   ┌─────────────────────────────────────────┐')
    console.log('   │ Role     │ Username │ Password         │')
    console.log('   ├─────────────────────────────────────────┤')
    console.log('   │ Admin    │ admin    │ password123      │')
    console.log('   │ Manager  │ manager  │ password123      │')
    console.log('   │ Cashier  │ kasir1   │ password123      │')
    console.log('   │ Cashier  │ kasir2   │ password123      │')
    console.log('   └─────────────────────────────────────────┘')
    console.log()
    console.log('💡 You can also login with email:')
    console.log('   • admin@deepos.com / password123')
    console.log()

  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect()
    console.log('📡 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run seed
seed()
