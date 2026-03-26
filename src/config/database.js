import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    // Mongoose connection options
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, options)
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`📦 Database: ${conn.connection.name}`)
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`)
    })
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected')
    })
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected')
    })
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close()
        console.log('MongoDB connection closed through app termination')
        process.exit(0)
      } catch (err) {
        console.error('Error closing MongoDB connection:', err)
        process.exit(1)
      }
    })
    
    return conn
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    console.error('Please check:')
    console.error('1. MongoDB URI is correct in .env file')
    console.error('2. Database user has proper permissions')
    console.error('3. IP address is whitelisted in MongoDB Atlas')
    console.error('4. Network connection is stable')
    process.exit(1)
  }
}

export default connectDB
