import express from 'express'
import {
  getTasks,
  getMyTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  searchTasks,
  exportTasks
} from '../controllers/taskController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.get('/my-tasks', protect, getMyTasks)
router.get('/search', protect, searchTasks)
router.get('/export', protect, exportTasks)

router
  .route('/')
  .get(protect, getTasks)
  .post(protect, createTask)

router
  .route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask)

router.post('/:id/assign', protect, authorize('admin', 'manager'), assignTask)

export default router
