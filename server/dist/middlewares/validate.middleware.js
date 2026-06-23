"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const formattedErrors = error.issues.map((e) => ({
                field: e.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params').join('.'),
                message: e.message,
            }));
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: formattedErrors,
            });
        }
        return res.status(400).json({
            success: false,
            message: error.message || "Validation Error",
        });
    }
};
exports.validate = validate;
exports.default = exports.validate;
