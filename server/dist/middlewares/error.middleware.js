"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const ApiError_1 = require("../utils/ApiError");
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError_1.ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Something went wrong";
        error = new ApiError_1.ApiError(statusCode, message, error?.errors || [], err.stack);
    }
    // Log error message and stack trace using Winston
    if (error.statusCode >= 500) {
        logger_1.default.error(`${error.message} - Stack: ${error.stack}`);
    }
    else {
        logger_1.default.warn(`${error.message} (Status: ${error.statusCode})`);
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
exports.errorHandler = errorHandler;
exports.default = exports.errorHandler;
