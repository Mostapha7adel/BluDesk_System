const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handlePrismaError = (err) => {
  if (err.code === 'P2002') {
    const target = err.meta?.target?.[0] || '';
    if (target.includes('phone')) return new AppError('Phone number already exists', 409);
    if (target.includes('email')) return new AppError('Email already exists', 409);
    if (target.includes('employeeNumber')) return new AppError('Employee number already exists', 409);
    return new AppError('Resource already exists', 409);
  }
  if (err.code === 'P2025') {
    return new AppError('Resource not found', 404);
  }
  if (err.code === 'P2003') {
    return new AppError('Related resource not found', 400);
  }
  return new AppError('Database error', 500);
};

const handleJwtError = () => {
  return new AppError('Invalid or expired token', 401);
};

const handleJwtExpiredError = () => {
  return new AppError('Token expired', 401);
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message, stack: err.stack };

  if (err.code && err.code.startsWith('P')) {
    error = handlePrismaError(err);
  }

  if (err.name === 'JsonWebTokenError') {
    error = handleJwtError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJwtExpiredError();
  }

  if (err.type === 'entity.parse.failed' || err.name === 'SyntaxError') {
    error = new AppError('Invalid JSON in request body', 400);
  }

  if (err.name === 'ValidationError') {
    error = new AppError(err.message, 400, err.errors);
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new AppError('File too large, maximum size is 5MB', 400);
    } else {
      error = new AppError(err.message, 400);
    }
  }

  logger.error(`${error.statusCode || 500} - ${error.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    return ApiResponse.error(res, message, statusCode, {
      ...(error.errors && { validation: error.errors }),
      stack: err.stack,
    });
  }

  return ApiResponse.error(res, message, statusCode, null);
};

module.exports = { AppError, errorHandler };
