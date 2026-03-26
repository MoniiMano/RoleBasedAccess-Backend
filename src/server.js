import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import { createServer } from 'http'
import { Server } from 'socket.io'

import connectDB from './config/database.js'
import errorHandler from './middleware/errorHandler.js'

// Routes
import authRoutes from './routes/authRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import sectionRoutes from './routes/sectionRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'


// Load env vars
dotenv.config()

const app = express()
const httpServer = createServer(app)

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
})

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`)
  })
  
  socket.on('task-update', (data) => {
    socket.to(`project-${data.projectId}`).emit('task-updated', data)
  })
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Make io accessible to routes
app.set('io', io)

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Cookie parser
app.use(cookieParser())

// Security headers
app.use(helmet())

// Sanitize data
app.use(mongoSanitize())

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased from 100 to 1000
  message: 'Too many requests from this IP, please try again later',
  skip: (req) => req.path.startsWith('/api/auth') || process.env.NODE_ENV === 'development' // Skip in dev
})

app.use('/api', limiter)

// Mount routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/sections', sectionRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000

// Start server only after database connection
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB()
    
    // Then start the server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
      console.log(`🌐 API available at http://localhost:${PORT}`)
      console.log(`💚 Health check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`)
  httpServer.close(() => process.exit(1))
})

// Start the application
startServer()

export default app
