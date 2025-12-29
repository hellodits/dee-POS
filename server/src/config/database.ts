import mongoose from 'mongoose'

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deepos'
    
    console.log('🔄 Connecting to MongoDB Atlas...')
    
    await mongoose.connect(mongoURI)
    
    console.log('✅ MongoDB Atlas connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    
    console.log('💡 Database connection failed - server will use mock auth')
    console.log('   Check your MONGODB_URI in .env file')
    console.log('   Make sure your IP is whitelisted in MongoDB Atlas Network Access')
    
    // Don't exit in development to allow frontend testing
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB disconnected')
})

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error)
})