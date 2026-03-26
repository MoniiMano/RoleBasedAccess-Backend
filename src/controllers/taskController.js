import Task from '../models/Task.js'
import * as XLSX from 'xlsx'

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedTo, project, section } = req.query
    
    let query = {}
    
    if (status) query.status = status
    if (priority) query.priority = priority
    if (assignedTo) query.assignedTo = assignedTo
    if (project) query.project = project
    if (section) query.section = section
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('section', 'name')
      .populate('createdBy', 'name email')
      .sort('-createdAt')
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get my tasks
// @route   GET /api/tasks/my-tasks
// @access  Private
export const getMyTasks = async (req, res, next) => {
  try {
    const { status } = req.query
    
    let query = { assignedTo: req.user._id }
    
    if (status) {
      query.status = status
    }
    
    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('section', 'name')
      .populate('createdBy', 'name email')
      .sort('-createdAt')
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('project', 'name')
      .populate('section', 'name')
      .populate('createdBy', 'name email')
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: task
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id
    
    const task = await Task.create(req.body)
    
    res.status(201).json({
      success: true,
      data: task
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id)
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }
    
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    
    res.status(200).json({
      success: true,
      data: task
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete task (soft delete)
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }
    
    await task.softDelete(req.user._id)
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Assign task to user
// @route   POST /api/tasks/:id/assign
// @access  Private (Admin, Manager)
export const assignTask = async (req, res, next) => {
  try {
    const { userId } = req.body
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: task
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Search tasks
// @route   GET /api/tasks/search
// @access  Private
export const searchTasks = async (req, res, next) => {
  try {
    const { q, status, priority, assignedTo, dateFrom, dateTo } = req.query
    
    let query = {}
    
    if (q) {
      query.$text = { $search: q }
    }
    
    if (status) query.status = status
    if (priority) query.priority = priority
    if (assignedTo) query.assignedTo = assignedTo
    
    if (dateFrom || dateTo) {
      query.createdAt = {}
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom)
      if (dateTo) query.createdAt.$lte = new Date(dateTo)
    }
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('section', 'name')
      .limit(50)
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Export tasks to Excel
// @route   GET /api/tasks/export
// @access  Private
export const exportTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedTo, project } = req.query
    
    let query = {}
    if (status) query.status = status
    if (priority) query.priority = priority
    if (assignedTo) query.assignedTo = assignedTo
    if (project) query.project = project
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('section', 'name')
      .lean()
    
    // Format data for Excel
    const data = tasks.map(task => ({
      Title: task.title,
      Description: task.description || '',
      Project: task.project?.name || '',
      Section: task.section?.name || '',
      Status: task.status,
      Priority: task.priority,
      'Assigned To': task.assignedTo?.name || 'Unassigned',
      'Due Date': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
      'Created At': new Date(task.createdAt).toLocaleDateString()
    }))
    
    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks')
    
    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.xlsx')
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.send(buffer)
  } catch (error) {
    next(error)
  }
}

export default {
  getTasks,
  getMyTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  searchTasks,
  exportTasks
}
