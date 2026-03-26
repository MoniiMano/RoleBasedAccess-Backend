import express from 'express'
import {
  getAdminStats,
  getManagerStats,
  getMemberStats
} from '../controllers/dashboardController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.get('/admin', protect, authorize('admin'), getAdminStats)
router.get('/manager', protect, authorize('admin', 'manager'), getManagerStats)
router.get('/member', protect, getMemberStats)

export default router
