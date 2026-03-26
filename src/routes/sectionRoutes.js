import express from 'express'
import {
  getSectionsByProject,
  getSection,
  createSection,
  updateSection,
  deleteSection
} from '../controllers/sectionController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router
  .route('/')
  .post(protect, authorize('admin', 'manager'), createSection)

router
  .route('/:id')
  .get(protect, getSection)
  .put(protect, authorize('admin', 'manager'), updateSection)
  .delete(protect, authorize('admin', 'manager'), deleteSection)

export default router
