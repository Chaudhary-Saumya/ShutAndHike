const errorHandler = (err, req, res, next) => {
  // Handle Mongo duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return res.status(409).json({
      success: false,
      message: `An account with this ${field} (${value}) already exists.`
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors || {}).map((el) => ({
        field: el.path,
        message: el.message
      }))
    });
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format: ${err.value}`
    });
  }

  // Handle Zod Error
  if (err.name === 'ZodError') {
    const issues = err.issues || err.errors || [];
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message
      }))
    });
  }

  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorHandler;
