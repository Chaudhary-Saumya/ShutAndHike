const { ZodError } = require('zod');

/**
 * Validates request data (body, params, or query) against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'params' | 'query'} [source='body']
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    req[source] = schema.parse(req[source]);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues || error.errors || [];
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: issues.map((err) => ({
          field: err.path.join('.') || source,
          message: err.message
        }))
      });
    }
    next(error);
  }
};

module.exports = validate;
