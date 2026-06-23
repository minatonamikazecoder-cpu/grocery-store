import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import logger from "../utils/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Log error message and stack trace using Winston
  if (error.statusCode >= 500) {
    logger.error(`${error.message} - Stack: ${error.stack}`);
  } else {
    logger.warn(`${error.message} (Status: ${error.statusCode})`);
  }

  const response = {
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    success: error.success,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
};

export default errorHandler;
