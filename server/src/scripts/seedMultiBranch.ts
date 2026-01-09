/**
 * Multi-Branch Database Seeding Script
 * 
 * This script migrates the POS system from single-branch to multi-branch (multi-tenancy).
 * It clears all existing data and creates a fresh multi-branch setup.
 * 
 * Usage: npm run seed:multi-branch
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Branch } from '../models/Branch'
import { User } from '../models/User'
import { Product } from '../models/Product'
import { Table } from '../models/Table'
import { Order } from '../models/Order'
import { InventoryLog } from '../models/InventoryLog'
import { Reservation } from '../models/Reservation'
import { Inventory } from '../models/Inventory'
import { Transaction } from '../models/Transaction'
import { Notification } from '../models/Notification'

// Load environment variables
dotenv.config()

// ============ SEED DATA ============

// Branches
const branches = [
  {
    name: 'Jakarta Pusat',
    address: 'Jl. Thamrin No. 123, Jakarta Pusat, DKI Jakarta 10230',
    phone: '+62-21-12345678',
    is_active: true
  },
  {
    name: 'Jakarta Selatan',
    address: 'Jl. Sudirman No. 456, Jakarta Selatan, DKI Jakarta 12190',
    phone: '+62-21-87654321',
    is_active: true
  }
]

// Users (will be populated with branch_ids after branches are created)
const users = [
  {
    username: 'owner',
    email: 'owner@deepos.com',
    password: 'password123',
    role: 'owner' as const,
    firstName: 'System',
    lastName: 'Owner',
    branch_id: null // OWNER has access to all branches
  },
  {
    username: 'admin',
    email: 'admin@deepos.com',
    password: 'password123',
    role: 'admin' as const,
    firstName: 'Admin',
    lastName: 'Jakarta Pusat'
  },
  {
    username: 'manager',
    email: 'manager@deepos.com',
    password: 'password123',
    role: 'manager' as const,
    firstName: 'Manager',
    lastName: 'Jakarta Pusat'
  },
  {
    username: 'kasir_pusat',
    email: 'kasir.pusat@deepos.com',
    password: 'password123',
    role: 'cashier' as const,
    firstName: 'Kasir',
    lastName: 'Jakarta Pusat'
  },
  {
    username: 'kasir_selatan',
    email: 'kasir.selatan@deepos.com',
    password: 'password123',
    role: 'cashier' as const,
    firstName: 'Kasir',
    lastName: 'Jakarta Selatan'
  }
]

// Products per branch (5 products each)
const productsTemplate = [
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
    is_active: true
  },
  {
    name: 'Ayam Bakar Madu',
    description: 'Ayam bakar dengan bumbu madu spesial',
    price: 45000,
    cost_price: 22000,
    stock: 50,
    category: 'Makanan',
    is_active: true
  },
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
    name: 'Kentang Goreng',
    description: 'French fries crispy dengan saus',
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
  }
]

// Tables per branch (5 tables each)
const tablesTemplate = [
  { number: 1, name: 'T-01', capacity: 2, status: 'Available' as const },
  { number: 2, name: 'T-02', capacity: 4, status: 'Available' as const },
  { number: 3, name: 'T-03', capacity: 4, status: 'Available' as const },
  { number: 4, name: 'T-04', capacity: 6, status: 'Available' as const },
  { number: 5, name: 'T-05', capacity: 8, status: 'Available' as const }
]

// ============ SEED FUNCTION ============

async function seedMultiBranch() {
  console.log('🌱 Starting Multi-Branch Database Migration...\n')

  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deepos'
    console.log('📡 Connecting to MongoDB...')
    await mongoose.connect(mongoURI)
    console.log('✅ Connected to MongoDB\n')

    // ========== STEP 1: CLEAR ALL EXISTING DATA ==========
    console.log('🗑️  STEP 1: Clearing all existing data...')
    await Promise.all([
      Branch.deleteMany({}),
      User.deleteMany({}),
      Product.deleteMany({}),
      Table.deleteMany({}),
      Order.deleteMany({}),
      InventoryLog.deleteMany({}),
      Reservation.deleteMany({}),
      Inventory.deleteMany({}),
      Transaction.deleteMany({}),
      Notification.deleteMany({})
    ])
    console.log('   ✅ All existing data cleared\n')

    // ========== STEP 2: CREATE BRANCHES ==========
    console.log('🏢 STEP 2: Creating branches...')
    const createdBranches = await Branch.create(branches)
    console.log(`   ✅ Created ${createdBranches.length} branches:`)
    createdBranches.forEach(branch => {
      console.log(`      - ${branch.name} (${branch.phone})`)
    })
    console.log()

    // ========== STEP 3: CREATE USERS ==========
    console.log('👤 STEP 3: Creating users...')
    
    // Create Owner (no branch_id)
    const ownerData = users[0]
    const owner = await User.create(ownerData)
    console.log(`   ✅ Created OWNER: ${owner.username}`)

    // Create Admin (assign to Jakarta Pusat)
    const admin = await User.create({
      ...users[1],
      branch_id: createdBranches[0]._id // Jakarta Pusat
    })
    console.log(`   ✅ Created ADMIN: ${admin.username} → ${createdBranches[0].name}`)

    // Create Manager (assign to Jakarta Pusat)
    const manager = await User.create({
      ...users[2],
      branch_id: createdBranches[0]._id // Jakarta Pusat
    })
    console.log(`   ✅ Created MANAGER: ${manager.username} → ${createdBranches[0].name}`)

    // Create Cashiers (assign to branches)
    const cashierPusat = await User.create({
      ...users[3],
      branch_id: createdBranches[0]._id // Jakarta Pusat
    })
    console.log(`   ✅ Created CASHIER: ${cashierPusat.username} → ${createdBranches[0].name}`)

    const cashierSelatan = await User.create({
      ...users[4],
      branch_id: createdBranches[1]._id // Jakarta Selatan
    })
    console.log(`   ✅ Created CASHIER: ${cashierSelatan.username} → ${createdBranches[1].name}`)
    console.log()

    // ========== STEP 4: CREATE PRODUCTS PER BRANCH ==========
    console.log('🍽️  STEP 4: Creating products per branch...')
    
    let totalProducts = 0
    for (const branch of createdBranches) {
      const branchProducts = productsTemplate.map(product => ({
        ...product,
        branch_id: branch._id
      }))
      
      const createdProducts = await Product.create(branchProducts)
      totalProducts += createdProducts.length
      console.log(`   ✅ Created ${createdProducts.length} products for ${branch.name}`)
    }
    console.log(`   📊 Total products created: ${totalProducts}\n`)

    // ========== STEP 5: CREATE TABLES PER BRANCH ==========
    console.log('🪑 STEP 5: Creating tables per branch...')
    
    let totalTables = 0
    for (const branch of createdBranches) {
      const branchTables = tablesTemplate.map(table => ({
        ...table,
        branch_id: branch._id
      }))
      
      const createdTables = await Table.create(branchTables)
      totalTables += createdTables.length
      console.log(`   ✅ Created ${createdTables.length} tables for ${branch.name}`)
    }
    console.log(`   📊 Total tables created: ${totalTables}\n`)

    // ========== SUMMARY ==========
    console.log('═'.repeat(60))
    console.log('🎉 MULTI-BRANCH MIGRATION COMPLETED SUCCESSFULLY!')
    console.log('═'.repeat(60))
    console.log()
    console.log('📋 Migration Summary:')
    console.log(`   • Branches: ${createdBranches.length}`)
    console.log(`   • Users: 5 (1 Owner + 1 Admin + 1 Manager + 2 Cashiers)`)
    console.log(`   • Products: ${totalProducts} (${productsTemplate.length} per branch)`)
    console.log(`   • Tables: ${totalTables} (${tablesTemplate.length} per branch)`)
    console.log()
    
    console.log('🏢 Branch Details:')
    createdBranches.forEach((branch, index) => {
      console.log(`   ${index + 1}. ${branch.name}`)
      console.log(`      📍 ${branch.address}`)
      console.log(`      📞 ${branch.phone}`)
      console.log(`      🆔 ID: ${branch._id}`)
      console.log()
    })

    console.log('🔐 Login Credentials:')
    console.log('   ┌──────────────────────────────────────────────────────────────┐')
    console.log('   │ Role     │ Username       │ Password    │ Branch Access      │')
    console.log('   ├──────────────────────────────────────────────────────────────┤')
    console.log('   │ Owner    │ owner          │ password123 │ All Branches       │')
    console.log('   │ Admin    │ admin          │ password123 │ Jakarta Pusat      │')
    console.log('   │ Manager  │ manager        │ password123 │ Jakarta Pusat      │')
    console.log('   │ Cashier  │ kasir_pusat    │ password123 │ Jakarta Pusat      │')
    console.log('   │ Cashier  │ kasir_selatan  │ password123 │ Jakarta Selatan    │')
    console.log('   └──────────────────────────────────────────────────────────────┘')
    console.log()
    
    console.log('💡 Multi-Branch Features:')
    console.log('   • Each branch has isolated products and tables')
    console.log('   • Cashiers can only access their assigned branch')
    console.log('   • Owner can access all branches')
    console.log('   • Orders are tracked per branch')
    console.log('   • Inventory logs are branch-specific')
    console.log()

  } catch (error) {
    console.error('❌ Multi-Branch Migration failed:', error)
    process.exit(1)
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect()
    console.log('📡 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run seed
seedMultiBranch()