/**
 * Debug Login Script
 * 
 * This script verifies that the OWNER user exists and can authenticate.
 * Usage: npx ts-node src/scripts/debugLogin.ts
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

dotenv.config()

async function debugLogin() {
  console.log('🔍 Debug Login Script\n')

  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deepos'
    console.log('📡 Connecting to MongoDB...')
    await mongoose.connect(mongoURI)
    console.log('✅ Connected\n')

    // Import User model
    const { User } = await import('../models/User')

    // Find owner user
    console.log('🔎 Looking for owner user...')
    const owner = await User.findOne({ 
      $or: [
        { email: 'owner@deepos.com' },
        { username: 'owner' }
      ]
    }).select('+password')

    if (!owner) {
      console.log('❌ Owner user NOT FOUND!')
      console.log('   Run: npm run seed:multi-branch')
      return
    }

    console.log('✅ Owner user found:')
    console.log(`   - ID: ${owner._id}`)
    console.log(`   - Username: ${owner.username}`)
    console.log(`   - Email: ${owner.email}`)
    console.log(`   - Role: ${owner.role}`)
    console.log(`   - Branch ID: ${owner.branch_id || 'null (correct for owner)'}`)
    console.log(`   - Is Active: ${owner.isActive}`)
    console.log(`   - Password hash: ${owner.password?.substring(0, 20)}...`)
    console.log()

    // Test password
    console.log('🔐 Testing password "password123"...')
    const testPassword = 'password123'
    
    // Method 1: Using model method
    const matchResult = await owner.matchPassword(testPassword)
    console.log(`   - matchPassword() result: ${matchResult}`)
    
    // Method 2: Direct bcrypt compare
    const directCompare = await bcrypt.compare(testPassword, owner.password)
    console.log(`   - bcrypt.compare() result: ${directCompare}`)

    if (matchResult && directCompare) {
      console.log('\n✅ Password verification PASSED!')
      console.log('   The login should work. Check if:')
      console.log('   1. Server is running (npm run dev)')
      console.log('   2. Server was restarted after seeding')
      console.log('   3. Frontend is connecting to correct API URL')
    } else {
      console.log('\n❌ Password verification FAILED!')
      console.log('   The password hash might be corrupted.')
      console.log('   Try re-running: npm run seed:multi-branch')
    }

    // List all users
    console.log('\n📋 All users in database:')
    const allUsers = await User.find({}).select('username email role branch_id isActive')
    allUsers.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.username} (${u.email}) - ${u.role} - branch: ${u.branch_id || 'all'}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n📡 Disconnected from MongoDB')
    process.exit(0)
  }
}

debugLogin()
