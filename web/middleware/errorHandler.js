/**
 * Central Error Handling Middleware
 * Catches all errors passed via next(error) and returns consistent JSON responses
 */

/**
 * 404 handler — must be placed before errorHandler
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * Global error handler
 * Maps error types to appropriate HTTP status codes
 */
export const errorHandler = (err, req, res, next) => {
  // Determine status code
  let statusCode = err.status || err.statusCode || 500;

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 422;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
  }

  // JWT / auth errors
  if (err.name === "UnauthorizedError" || err.name === "JsonWebTokenError") {
    statusCode = 401;
  }

  const isDev = process.env.NODE_ENV !== "production";

  // Log error in development
  if (isDev) {
    console.error(`[ERROR] ${err.name}: ${err.message}`);
    if (err.stack) console.error(err.stack);
  } else {
    // Production: log only essential info
    console.error(`[ERROR] ${statusCode} - ${err.message} - ${req.originalUrl}`);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    ...(isDev && { stack: err.stack }),
  });
};
