import express from 'express'
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  searchProjects
} from '../controllers/projectController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.get('/search', protect, searchProjects)

router
  .route('/')
  .get(protect, getProjects)
  .post(protect, authorize('admin', 'manager'), createProject)

router
  .route('/:id')
  .get(protect, getProject)
  .put(protect, authorize('admin', 'manager'), updateProject)
  .delete(protect, authorize('admin', 'manager'), deleteProject)

export default router
