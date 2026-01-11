/**
 * Multi-Branch Testing Script
 * 
 * Tests:
 * 1. Login dengan berbagai role
 * 2. Data terfilter dengan benar per branch
 * 3. OWNER bisa lihat semua data
 * 4. Manager/Cashier hanya lihat data branch mereka
 * 
 * Usage: npm run test:multi-branch
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from '../models/User'
import { Branch } from '../models/Branch'
import { Product } from '../models/Product'
import { Staff } from '../models/Staff'
import { Table } from '../models/Table'

dotenv.config()

const API_URL = process.env.API_URL || 'http://localhost:5000/api'

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

interface TestResult {
  test: string
  passed: boolean
  details?: string
}

const results: TestResult[] = []

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const icons = { info: '📋', success: '✅', error: '❌', warn: '⚠️' }
  console.log(`${icons[type]} ${message}`)
}

function addResult(test: string, passed: boolean, details?: string) {
  results.push({ test, passed, details })
  if (passed) {
    log(`${test}: PASSED`, 'success')
  } else {
    log(`${test}: FAILED - ${details}`, 'error')
  }
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/deepos')
    log('Connected to MongoDB', 'success')
  } catch (error) {
    log('Failed to connect to MongoDB', 'error')
    process.exit(1)
  }
}

async function testLogin(email: string, password: string): Promise<{ token: string; user: any } | null> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    const data = await response.json() as ApiResponse
    
    if (data.success && data.data) {
      return { token: data.data.token, user: data.data.user }
    }
    return null
  } catch (error) {
    return null
  }
}

async function fetchWithAuth(endpoint: string, token: string, params?: Record<string, string>): Promise<ApiResponse> {
  const url = new URL(`${API_URL}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))
  }
  
  const response = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  return response.json() as Promise<ApiResponse>
}

async function runTests() {
  log('\n========================================', 'info')
  log('   MULTI-BRANCH TESTING SUITE', 'info')
  log('========================================\n', 'info')

  // Get branches for reference
  const branches = await Branch.find({ is_active: true })
  if (branches.length < 2) {
    log('Need at least 2 branches. Run: npm run seed:multi-branch', 'error')
    return
  }
  
  const branch1 = branches[0]
  const branch2 = branches[1]
  log(`Branch 1: ${branch1.name} (${branch1._id})`, 'info')
  log(`Branch 2: ${branch2.name} (${branch2._id})`, 'info')

  // ============================================
  // TEST 1: Login dengan berbagai role
  // ============================================
  log('\n--- TEST 1: Login dengan berbagai role ---\n', 'info')

  // Test Owner login
  const ownerLogin = await testLogin('owner@deepos.com', 'password123')
  addResult(
    'Owner login',
    ownerLogin !== null && ownerLogin.user.role === 'owner',
    ownerLogin ? `Role: ${ownerLogin.user.role}` : 'Login failed'
  )

  // Test Admin login
  const adminLogin = await testLogin('admin@deepos.com', 'password123')
  addResult(
    'Admin login',
    adminLogin !== null && adminLogin.user.role === 'admin',
    adminLogin ? `Role: ${adminLogin.user.role}, Branch: ${adminLogin.user.branch_id}` : 'Login failed'
  )

  // Test Manager login
  const managerLogin = await testLogin('manager@deepos.com', 'password123')
  addResult(
    'Manager login',
    managerLogin !== null && managerLogin.user.role === 'manager',
    managerLogin ? `Role: ${managerLogin.user.role}, Branch: ${managerLogin.user.branch_id}` : 'Login failed'
  )

  // Test Cashier Pusat login
  const kasirPusatLogin = await testLogin('kasir.pusat@deepos.com', 'password123')
  addResult(
    'Kasir Pusat login',
    kasirPusatLogin !== null && kasirPusatLogin.user.role === 'cashier',
    kasirPusatLogin ? `Role: ${kasirPusatLogin.user.role}, Branch: ${kasirPusatLogin.user.branch_id}` : 'Login failed'
  )

  // Test Cashier Selatan login
  const kasirSelatanLogin = await testLogin('kasir.selatan@deepos.com', 'password123')
  addResult(
    'Kasir Selatan login',
    kasirSelatanLogin !== null && kasirSelatanLogin.user.role === 'cashier',
    kasirSelatanLogin ? `Role: ${kasirSelatanLogin.user.role}, Branch: ${kasirSelatanLogin.user.branch_id}` : 'Login failed'
  )

  // ============================================
  // TEST 2: OWNER dapat melihat semua data
  // ============================================
  log('\n--- TEST 2: OWNER dapat melihat semua data ---\n', 'info')

  if (ownerLogin) {
    // Count total products in DB
    const totalProducts = await Product.countDocuments({ is_active: true })
    const branch1Products = await Product.countDocuments({ branch_id: branch1._id, is_active: true })
    const branch2Products = await Product.countDocuments({ branch_id: branch2._id, is_active: true })
    
    log(`DB: Total products=${totalProducts}, Branch1=${branch1Products}, Branch2=${branch2Products}`, 'info')

    // Owner without branch filter should see all
    const ownerAllProducts = await fetchWithAuth('/products', ownerLogin.token)
    addResult(
      'OWNER sees all products (no filter)',
      ownerAllProducts.success && ownerAllProducts.data?.length === totalProducts,
      `Expected: ${totalProducts}, Got: ${ownerAllProducts.data?.length || 0}`
    )

    // Owner with branch filter should see only that branch
    const ownerBranch1Products = await fetchWithAuth('/products', ownerLogin.token, { branch_id: branch1._id.toString() })
    addResult(
      'OWNER sees Branch 1 products (with filter)',
      ownerBranch1Products.success && ownerBranch1Products.data?.length === branch1Products,
      `Expected: ${branch1Products}, Got: ${ownerBranch1Products.data?.length || 0}`
    )

    // Test staff (may be 0 if not seeded)
    const totalStaff = await Staff.countDocuments({ isActive: true })
    if (totalStaff > 0) {
      const ownerAllStaff = await fetchWithAuth('/staff', ownerLogin.token)
      addResult(
        'OWNER sees all staff',
        ownerAllStaff.success && ownerAllStaff.data?.length === totalStaff,
        `Expected: ${totalStaff}, Got: ${ownerAllStaff.data?.length || 0}`
      )
    } else {
      log('Skipping staff test - no staff data seeded', 'warn')
    }

    // Test tables
    const totalTables = await Table.countDocuments({})
    if (totalTables > 0) {
      const ownerAllTables = await fetchWithAuth('/tables', ownerLogin.token)
      addResult(
        'OWNER sees all tables',
        ownerAllTables.success && ownerAllTables.data?.length === totalTables,
        `Expected: ${totalTables}, Got: ${ownerAllTables.data?.length || 0}`
      )
    } else {
      log('Skipping tables test - no tables data', 'warn')
    }
  }

  // ============================================
  // TEST 3: Manager/Cashier hanya lihat data branch mereka
  // ============================================
  log('\n--- TEST 3: Non-OWNER hanya lihat data branch mereka ---\n', 'info')

  if (kasirPusatLogin) {
    const kasirBranchId = kasirPusatLogin.user.branch_id
    const branchProductCount = await Product.countDocuments({ branch_id: kasirBranchId, is_active: true })
    const branchTableCount = await Table.countDocuments({ branch_id: kasirBranchId })

    log(`Kasir Pusat Branch ID: ${kasirBranchId}`, 'info')
    log(`Expected: Products=${branchProductCount}, Tables=${branchTableCount}`, 'info')

    // Products
    const kasirProducts = await fetchWithAuth('/products', kasirPusatLogin.token)
    addResult(
      'Kasir Pusat sees only their branch products',
      kasirProducts.success && kasirProducts.data?.length === branchProductCount,
      `Expected: ${branchProductCount}, Got: ${kasirProducts.data?.length || 0}`
    )

    // Verify all products belong to their branch
    const allBelongToBranch = kasirProducts.data?.every((p: any) => 
      p.branch_id === kasirBranchId || p.branch_id?._id === kasirBranchId
    )
    addResult(
      'All products belong to Kasir Pusat branch',
      allBelongToBranch === true,
      allBelongToBranch ? 'All products verified' : 'Some products from other branches!'
    )

    // Staff - Kasir doesn't have access to staff endpoint (only admin/manager/owner)
    log('Skipping staff test for Kasir - no access to staff endpoint', 'warn')

    // Tables
    const kasirTables = await fetchWithAuth('/tables', kasirPusatLogin.token)
    addResult(
      'Kasir Pusat sees only their branch tables',
      kasirTables.success && kasirTables.data?.length === branchTableCount,
      `Expected: ${branchTableCount}, Got: ${kasirTables.data?.length || 0}`
    )
  }

  if (kasirSelatanLogin) {
    const kasirBranchId = kasirSelatanLogin.user.branch_id
    const branchProductCount = await Product.countDocuments({ branch_id: kasirBranchId, is_active: true })

    log(`Kasir Selatan Branch ID: ${kasirBranchId}`, 'info')

    const kasirProducts = await fetchWithAuth('/products', kasirSelatanLogin.token)
    addResult(
      'Kasir Selatan sees only their branch products',
      kasirProducts.success && kasirProducts.data?.length === branchProductCount,
      `Expected: ${branchProductCount}, Got: ${kasirProducts.data?.length || 0}`
    )

    // Verify isolation - Kasir Selatan should NOT see Kasir Pusat data
    if (kasirPusatLogin) {
      const pusatBranchId = kasirPusatLogin.user.branch_id
      const hasOtherBranchData = kasirProducts.data?.some((p: any) => 
        p.branch_id === pusatBranchId || p.branch_id?._id === pusatBranchId
      )
      addResult(
        'Kasir Selatan cannot see Kasir Pusat data',
        hasOtherBranchData === false,
        hasOtherBranchData ? 'SECURITY ISSUE: Can see other branch data!' : 'Properly isolated'
      )
    }
  }

  // ============================================
  // TEST 4: Branch isolation for reports
  // ============================================
  log('\n--- TEST 4: Reports branch filtering ---\n', 'info')

  if (ownerLogin && kasirPusatLogin) {
    // Owner dashboard
    const ownerDashboard = await fetchWithAuth('/reports/dashboard', ownerLogin.token)
    addResult(
      'OWNER can access dashboard',
      ownerDashboard.success === true,
      ownerDashboard.success ? 'Dashboard accessible' : ownerDashboard.error
    )

    // Kasir dashboard (should be filtered)
    const kasirDashboard = await fetchWithAuth('/reports/dashboard', kasirPusatLogin.token)
    addResult(
      'Kasir can access dashboard (filtered)',
      kasirDashboard.success === true,
      kasirDashboard.success ? 'Dashboard accessible' : kasirDashboard.error
    )
  }

  // ============================================
  // SUMMARY
  // ============================================
  log('\n========================================', 'info')
  log('   TEST SUMMARY', 'info')
  log('========================================\n', 'info')

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length

  log(`Total Tests: ${total}`, 'info')
  log(`Passed: ${passed}`, 'success')
  if (failed > 0) {
    log(`Failed: ${failed}`, 'error')
    log('\nFailed Tests:', 'error')
    results.filter(r => !r.passed).forEach(r => {
      log(`  - ${r.test}: ${r.details}`, 'error')
    })
  }

  const successRate = ((passed / total) * 100).toFixed(1)
  log(`\nSuccess Rate: ${successRate}%`, passed === total ? 'success' : 'warn')

  return failed === 0
}

async function main() {
  await connectDB()
  
  try {
    const success = await runTests()
    process.exit(success ? 0 : 1)
  } catch (error) {
    log(`Test error: ${error}`, 'error')
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

main()
