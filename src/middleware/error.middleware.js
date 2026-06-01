const AppError = require("../utils/appError");

// Formatter for development environment
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

// Formatter for production environment
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // Operational, trusted error: send friendly message to client
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or internal system error: don't leak details in production
    console.error("CRITICAL ERROR 💥:", err);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Something went wrong! Please try again later.",
    });
  }
};

// Helpers to handle database & library specific errors
const handlePostgresUniqueViolation = (err) => {
  const detail = err.detail || "";
  let message = "A duplicate value was provided. Please use a unique value.";
  
  // Extract duplicated field if possible, e.g. "Key (email)=(test@test.com) already exists."
  const match = detail.match(/\((.*?)\)=\((.*?)\)/);
  if (match && match[1]) {
    const field = match[1];
    message = `The ${field} already exists. Please choose a different ${field}.`;
  }
  
  return new AppError(message, 400);
};

const handlePostgresForeignKeyViolation = () => {
  return new AppError("The referenced database resource does not exist.", 400);
};

const handlePostgresInvalidTextRepresentation = () => {
  return new AppError("Invalid resource identifier format.", 400);
};

const handleJWTError = () => {
  return new AppError("Invalid credentials. Please authenticate again.", 401);
};

const handleJWTExpiredError = () => {
  return new AppError("Your session has expired. Please log in again.", 401);
};

const errormiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;
  error.name = err.name;
  error.code = err.code;

  error.statusCode = err.statusCode || err.status || 500;
  error.status = err.status || "error";

  // Normalize Operational status flag
  if (err instanceof AppError || err.isOperational) {
    error.isOperational = true;
  }

  // 1. Identify & normalize database errors
  if (error.code === "23505") {
    error = handlePostgresUniqueViolation(error);
  } else if (error.code === "23503") {
    error = handlePostgresForeignKeyViolation();
  } else if (error.code === "22P02") {
    error = handlePostgresInvalidTextRepresentation();
  }

  // 2. Identify & normalize JWT errors
  if (error.name === "JsonWebTokenError") {
    error = handleJWTError();
  } else if (error.name === "TokenExpiredError") {
    error = handleJWTExpiredError();
  }

  // 3. Send environment-specific payload
  const isDev = !process.env.NODE_ENV || process.env.NODE_ENV.trim() !== "production";
  if (isDev) {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

module.exports = errormiddleware;