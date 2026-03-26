# VistaFlow Backend API

Internal Workflow & Team Management Platform - Backend API built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Fastest Way (Docker)
```bash
# Start MongoDB
docker-compose up -d

# Use local config
cp .env.local .env

# Install & test
npm install
npm run test:connection

# Start server
npm run dev
```

Server runs at: **http://localhost:5000**

## 📋 Prerequisites

- Node.js 18+ 
- Docker (recommended) OR MongoDB installed locally
- npm or yarn

## 🔧 Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database

**Option A: Docker (Recommended)**
```bash
npm run docker:up
```

**Option B: Docker Command**
```bash
docker run -d -p 27017:27017 --name vistaflow-mongo mongo:latest
```

**Option C: MongoDB Atlas**
- See `MONGODB_SOLUTIONS.md` for detailed setup

### 3. Configure Environment
```bash
# For local MongoDB
cp .env.local .env

# For MongoDB Atlas - edit .env and update MONGODB_URI
```

### 4. Test Connection
```bash
npm run test:connection
```

### 5. Start Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (Admin/Manager)
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project (Admin/Manager)
- `DELETE /api/projects/:id` - Delete project (Admin/Manager)
- `GET /api/projects/search?q=query` - Search projects

### Sections
- `GET /api/sections/:id` - Get section by ID
- `POST /api/sections` - Create section (Admin/Manager)
- `PUT /api/sections/:id` - Update section (Admin/Manager)
- `DELETE /api/sections/:id` - Delete section (Admin/Manager)

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/my-tasks` - Get current user's tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/assign` - Assign task (Admin/Manager)
- `GET /api/tasks/search?q=query` - Search tasks
- `GET /api/tasks/export` - Export tasks to Excel

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard stats
- `GET /api/dashboard/manager` - Manager dashboard stats
- `GET /api/dashboard/member` - Member dashboard stats

## 🔐 Authentication

Uses JWT tokens stored in HttpOnly cookies for security.

**Register Example:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

**Login Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 🗄️ Database Schema

### User
- name: String (required)
- email: String (required, unique)
- password: String (required, hashed)
- role: Enum ['admin', 'manager', 'member']
- isActive: Boolean
- isDeleted: Boolean (soft delete)

### Project
- name: String (required)
- description: String
- status: Enum ['planning', 'active', 'on-hold', 'completed', 'archived']
- priority: Enum ['low', 'medium', 'high', 'urgent']
- startDate: Date
- endDate: Date
- owner: ObjectId (User)
- members: [ObjectId] (Users)
- isDeleted: Boolean (soft delete)

### Section
- name: String (required)
- description: String
- project: ObjectId (Project, required)
- order: Number
- isDeleted: Boolean (soft delete)

### Task
- title: String (required)
- description: String
- section: ObjectId (Section, required)
- project: ObjectId (Project, required)
- assignedTo: ObjectId (User)
- status: Enum ['todo', 'in-progress', 'review', 'completed', 'blocked']
- priority: Enum ['low', 'medium', 'high', 'urgent']
- dueDate: Date
- tags: [String]
- order: Number
- createdBy: ObjectId (User, required)
- isDeleted: Boolean (soft delete)

## 🛡️ Security Features

- JWT authentication with HttpOnly cookies
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- MongoDB injection protection
- Helmet.js security headers
- CORS configuration
- Input validation with Zod
- Role-based access control

## 🗄️ Why MongoDB?

1. **Flexible Schema**: Easy to iterate on data models during development
2. **Hierarchical Data**: Natural fit for Projects → Sections → Tasks structure
3. **JSON-like Documents**: Seamless integration with Node.js/Express
4. **Scalability**: Horizontal scaling with sharding
5. **Rich Queries**: Powerful aggregation pipeline for dashboard stats

## 🐳 Docker Commands

```bash
# Start services
npm run docker:up

# Stop services
npm run docker:down

# View logs
npm run docker:logs

# Access MongoDB UI
# http://localhost:8081 (admin/admin123)
```

## 🧪 Testing

```bash
# Test MongoDB connection
npm run test:connection

# Test health endpoint
curl http://localhost:5000/health
```

## 🚨 Troubleshooting

### MongoDB Connection Issues
See `MONGODB_SOLUTIONS.md` for detailed solutions.

**Quick fix:**
```bash
# Use local MongoDB
docker run -d -p 27017:27017 mongo
cp .env.local .env
npm run test:connection
```

### Port Already in Use
```bash
# Change port in .env
PORT=5001
```

## 📦 Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vistaflow
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🎯 Features Implemented

- ✅ User authentication & authorization (JWT)
- ✅ Role-based access control (Admin, Manager, Member)
- ✅ Hierarchical data structure (Projects → Sections → Tasks)
- ✅ Full CRUD operations for all entities
- ✅ Task assignment to users
- ✅ Role-specific dashboards
- ✅ Search & filter functionality
- ✅ Excel export for tasks
- ✅ Soft delete with activity tracking
- ✅ Real-time updates with Socket.io
- ✅ Rate limiting & security
- ✅ Input validation
- ✅ Error handling

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   └── server.js        # App entry point
├── .env                 # Environment variables
├── docker-compose.yml   # Docker setup
└── package.json
```

## 🔮 Future Improvements

- Add comprehensive test suite (Jest/Mocha)
- Implement caching with Redis
- Add file upload for attachments
- Email notifications
- Advanced analytics
- API documentation with Swagger
- Database indexing optimization
- Logging with Winston/Morgan

## 📝 Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message"
}
```

Common status codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not authorized)
- 404: Not Found
- 500: Internal Server Error

---

**Need Help?**
- Check `quick-start.md` for step-by-step guide
- See `MONGODB_SOLUTIONS.md` for connection issues
- Run `npm run test:connection` to diagnose problems
