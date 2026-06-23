"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    statusCode;
    success;
    message;
    data;
    meta;
    constructor(statusCode, data, message = "Success", meta) {
        this.statusCode = statusCode;
        this.success = statusCode >= 200 && statusCode < 300;
        this.message = message;
        this.data = data;
        if (meta) {
            this.meta = meta;
        }
    }
    toJSON() {
        return {
            success: this.success,
            message: this.message,
            data: this.data,
            ...(this.meta && { meta: this.meta }),
        };
    }
}
exports.ApiResponse = ApiResponse;
