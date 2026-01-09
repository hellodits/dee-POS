/**
 * Fix Table Index for Multi-Branch
 * 
 * Drops old unique index on 'number' field and ensures compound index exists
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function fixTableIndex() {
  console.log('🔧 Fixing Table Index for Multi-Branch...\n')

  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deepos'
    console.log('📡 Connecting to MongoDB...')
    await mongoose.connect(mongoURI)
    console.log('✅ Connected to MongoDB\n')

    const db = mongoose.connection.db!
    const collection = db.collection('tables')

    // Get current indexes
    console.log('📋 Current indexes:')
    const indexes = await collection.indexes()
    indexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`)
    })
    console.log()

    // Drop old unique index on 'number' if it exists
    try {
      await collection.dropIndex('number_1')
      console.log('✅ Dropped old unique index on "number" field')
    } catch (error: any) {
      if (error.code === 27) {
        console.log('ℹ️  Index "number_1" does not exist (already dropped)')
      } else {
        console.log('⚠️  Could not drop index:', error.message)
      }
    }

    // Ensure compound unique index exists
    try {
      await collection.createIndex(
        { branch_id: 1, number: 1 }, 
        { unique: true, name: 'branch_number_unique' }
      )
      console.log('✅ Created compound unique index: { branch_id: 1, number: 1 }')
    } catch (error: any) {
      if (error.code === 85) {
        console.log('ℹ️  Compound index already exists')
      } else {
        console.log('⚠️  Could not create compound index:', error.message)
      }
    }

    // Show final indexes
    console.log('\n📋 Final indexes:')
    const finalIndexes = await collection.indexes()
    finalIndexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`)
    })

    console.log('\n🎉 Table index fix completed!')

  } catch (error) {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('📡 Disconnected from MongoDB')
    process.exit(0)
  }
}

fixTableIndex()