import { z } from 'zod'

// Validation middleware factory
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        })
      }
      next(error)
    }
  }
}

export default validate
