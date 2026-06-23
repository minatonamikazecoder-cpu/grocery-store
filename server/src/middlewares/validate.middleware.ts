import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, ZodIssue } from "zod";

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error: any) {
    if (error instanceof ZodError) {
      const formattedErrors = error.issues.map((e: ZodIssue) => ({
        field: e.path.filter((p: any) => p !== 'body' && p !== 'query' && p !== 'params').join('.'),
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

export default validate;
