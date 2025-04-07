const response = require("../utils/response");

class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

exports.AppError = AppError;

exports.errorHandler = async (err, req, res) => {
  try {
    console.error("Error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      errors: err.errors,
    });

    if (err.name === "ValidationError") {
      const errors = Object.keys(err.errors).reduce((acc, key) => {
        acc.push({
          field: key,
          message: err.errors[key].message,
          type: err.errors[key].name,
          value: err.errors[key].value,
          path: err.errors[key].path,
        });
        return acc;
      }, []);

      return response(res, 400, "Validation Error", errors);
    }

    if (err.name === "CastError") {
      return response(res, 400, `Invalid ${err.path}: ${err.value}`);
    }

    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return response(
        res,
        400,
        `Duplicate field value: ${field}. Please use another value`
      );
    }

    if (err.name === "JsonWebTokenError") {
      return response(res, 401, "Invalid token. Please log in again");
    }

    if (err.name === "TokenExpiredError") {
      return response(res, 401, "Your token has expired. Please log in again");
    }

    if (err.name === "SyntaxError") {
      return response(res, 400, "Invalid JSON syntax");
    }

    if (err.name === "MulterError") {
      switch (err.code) {
        case "LIMIT_FILE_SIZE":
          return response(res, 400, "File size is too large");
        case "LIMIT_FILE_COUNT":
          return response(res, 400, "Too many files uploaded");
        case "LIMIT_UNEXPECTED_FILE":
          return response(res, 400, "Unexpected file field");
        default:
          return response(res, 400, "File upload error");
      }
    }

    if (err.isOperational) {
      return response(res, err.statusCode, err.message, err.errors);
    }

    return response(res, 500, "Something went wrong!", {
      error: process.env.NODE_ENV === "development" ? err : undefined,
    });
  } catch (error) {
    console.error("Error in error handler:", error);
    return response(res, 500, "Internal Server Error");
  }
};

exports.globalErrorHandler = (err, req, res) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
    });
  }
};

exports.catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
