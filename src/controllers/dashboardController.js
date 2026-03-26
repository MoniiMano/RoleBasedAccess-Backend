import Project from '../models/Project.js'
import Task from '../models/Task.js'
import User from '../models/User.js'

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
export const getAdminStats = async (req, res, next) => {
  try {
    const [totalProjects, totalTasks, totalUsers, activeProjects] = await Promise.all([
      Project.countDocuments(),
      Task.countDocuments(),
      User.countDocuments(),
      Project.countDocuments({ status: 'active' })
    ])
    
    const tasksByStatus = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
    
    const projectsByStatus = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
    
    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        totalUsers,
        activeProjects,
        tasksByStatus,
        projectsByStatus
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get manager dashboard stats
// @route   GET /api/dashboard/manager
// @access  Private (Manager)
export const getManagerStats = async (req, res, next) => {
  try {
    const userId = req.user._id
    
    const [myProjects, teamTasks, teamMembers] = await Promise.all([
      Project.countDocuments({
        $or: [{ owner: userId }, { members: userId }]
      }),
      Task.countDocuments({
        project: {
          $in: await Project.find({
            $or: [{ owner: userId }, { members: userId }]
          }).distinct('_id')
        }
      }),
      User.countDocuments({ role: 'member' })
    ])
    
    const completedTasks = await Task.countDocuments({
      status: 'completed',
      project: {
        $in: await Project.find({
          $or: [{ owner: userId }, { members: userId }]
        }).distinct('_id')
      }
    })
    
    res.status(200).json({
      success: true,
      data: {
        myProjects,
        teamTasks,
        teamMembers,
        completedTasks
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get member dashboard stats
// @route   GET /api/dashboard/member
// @access  Private (Member)
export const getMemberStats = async (req, res, next) => {
  try {
    const userId = req.user._id
    
    const [totalTasks, inProgressTasks, completedTasks] = await Promise.all([
      Task.countDocuments({ assignedTo: userId }),
      Task.countDocuments({ assignedTo: userId, status: 'in-progress' }),
      Task.countDocuments({ assignedTo: userId, status: 'completed' })
    ])
    
    const recentTasks = await Task.find({ assignedTo: userId })
      .populate('project', 'name')
      .populate('section', 'name')
      .sort('-createdAt')
      .limit(5)
    
    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        inProgressTasks,
        completedTasks,
        recentTasks
      }
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getAdminStats,
  getManagerStats,
  getMemberStats
}
