import mongoose from 'mongoose'

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a section name'],
    trim: true,
    maxlength: [100, 'Section name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot be more than 300 characters']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Section must belong to a project']
  },
  order: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
sectionSchema.index({ project: 1, order: 1 })
sectionSchema.index({ isDeleted: 1 })
sectionSchema.index({ name: 'text' })

// Virtual for tasks
sectionSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'section'
})

// Soft delete
sectionSchema.methods.softDelete = function(userId) {
  this.isDeleted = true
  this.deletedAt = new Date()
  this.deletedBy = userId
  return this.save()
}

// Hide deleted by default
sectionSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false })
  }
  next()
})

const Section = mongoose.model('Section', sectionSchema)

export default Section
