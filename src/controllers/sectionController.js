import Section from '../models/Section.js'
import Project from '../models/Project.js'

// @desc    Get sections by project
// @route   GET /api/projects/:projectId/sections
// @access  Private
export const getSectionsByProject = async (req, res, next) => {
  try {
    const sections = await Section.find({ project: req.params.projectId })
      .populate('project', 'name')
      .sort('order')
    
    res.status(200).json({
      success: true,
      count: sections.length,
      data: sections
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single section
// @route   GET /api/sections/:id
// @access  Private
export const getSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('project', 'name')
      .populate({
        path: 'tasks',
        populate: { path: 'assignedTo', select: 'name email' }
      })
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: section
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create new section
// @route   POST /api/sections
// @access  Private (Admin, Manager)
export const createSection = async (req, res, next) => {
  try {
    // Verify project exists
    const project = await Project.findById(req.body.project)
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }
    
    const section = await Section.create(req.body)
    
    res.status(201).json({
      success: true,
      data: section
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update section
// @route   PUT /api/sections/:id
// @access  Private (Admin, Manager)
export const updateSection = async (req, res, next) => {
  try {
    let section = await Section.findById(req.params.id)
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      })
    }
    
    section = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    
    res.status(200).json({
      success: true,
      data: section
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete section (soft delete)
// @route   DELETE /api/sections/:id
// @access  Private (Admin, Manager)
export const deleteSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id)
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      })
    }
    
    await section.softDelete(req.user._id)
    
    res.status(200).json({
      success: true,
      message: 'Section deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getSectionsByProject,
  getSection,
  createSection,
  updateSection,
  deleteSection
}
