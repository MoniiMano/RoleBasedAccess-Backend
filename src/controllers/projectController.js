import Project from '../models/Project.js'
import Section from '../models/Section.js'
import Task from '../models/Task.js'

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query
    
    let query = {}
    
    // Filter by status
    if (status) {
      query.status = status
    }
    
    // Filter by priority
    if (priority) {
      query.priority = priority
    }
    
    // Search
    if (search) {
      query.$text = { $search: search }
    }
    
    // Role-based filtering
    if (req.user.role === 'member') {
      query.members = req.user._id
    } else if (req.user.role === 'manager') {
      query.$or = [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    }
    
    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email role')
      .sort('-createdAt')
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email role')
      .populate({
        path: 'sections',
        populate: {
          path: 'tasks',
          populate: { path: 'assignedTo', select: 'name email' }
        }
      })
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: project
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin, Manager)
export const createProject = async (req, res, next) => {
  try {
    req.body.owner = req.user._id
    
    const project = await Project.create(req.body)
    
    res.status(201).json({
      success: true,
      data: project
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin, Manager)
export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id)
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }
    
    // Check ownership
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      })
    }
    
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    
    res.status(200).json({
      success: true,
      data: project
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete project (soft delete)
// @route   DELETE /api/projects/:id
// @access  Private (Admin, Manager)
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }
    
    // Check ownership
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      })
    }
    
    await project.softDelete(req.user._id)
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Search projects
// @route   GET /api/projects/search
// @access  Private
export const searchProjects = async (req, res, next) => {
  try {
    const { q } = req.query
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      })
    }
    
    const projects = await Project.find({
      $text: { $search: q }
    })
      .populate('owner', 'name email')
      .limit(20)
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  searchProjects
}
