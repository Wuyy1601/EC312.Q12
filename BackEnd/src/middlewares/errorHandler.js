// Global error handler middleware

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Không tìm thấy tài nguyên';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} đã tồn tại`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Lỗi server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Not found middleware
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} không tồn tại`
  });
};
