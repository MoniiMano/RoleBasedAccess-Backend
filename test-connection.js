import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

console.log('🔍 Testing MongoDB Connection...\n')
console.log('Environment:', process.env.NODE_ENV)
console.log('MongoDB URI:', process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'))
console.log('\n⏳ Attempting connection...\n')

const testConnection = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    
    console.log('✅ SUCCESS! MongoDB Connected')
    console.log('Host:', conn.connection.host)
    console.log('Database:', conn.connection.name)
    console.log('Port:', conn.connection.port)
    console.log('\n✨ Your backend is ready to run!')
    
    await mongoose.connection.close()
    process.exit(0)
    
  } catch (error) {
    console.error('❌ CONNECTION FAILED\n')
    console.error('Error Type:', error.name)
    console.error('Error Message:', error.message)
    console.error('\n📋 Troubleshooting Steps:\n')
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error('🔴 Network/DNS Issue Detected')
      console.error('   → Your computer cannot reach MongoDB Atlas servers')
      console.error('   → This is usually a firewall, VPN, or network restriction\n')
      console.error('Solutions:')
      console.error('   1. Check if you\'re behind a corporate firewall')
      console.error('   2. Try disabling VPN if you\'re using one')
      console.error('   3. Try from a different network (mobile hotspot)')
      console.error('   4. Use local MongoDB instead (see below)\n')
    } else if (error.message.includes('authentication failed')) {
      console.error('🔴 Authentication Issue')
      console.error('   → Username or password is incorrect')
      console.error('   → Check MongoDB Atlas Database Access settings\n')
    } else if (error.message.includes('IP') || error.message.includes('not authorized')) {
      console.error('🔴 IP Whitelist Issue')
      console.error('   → Your IP is not whitelisted in MongoDB Atlas')
      console.error('   → Go to Network Access and add 0.0.0.0/0 for testing\n')
    }
    
    console.error('🔧 Quick Fix: Use Local MongoDB')
    console.error('   Run: docker run -d -p 27017:27017 mongo')
    console.error('   Then update .env:')
    console.error('   MONGODB_URI=mongodb://localhost:27017/vistaflow\n')
    
    process.exit(1)
  }
}

testConnection()
