import type { NextFunction, Request, RequestHandler, Response } from "express";
import { HttpError } from "./errors.js";

export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({
      message: error.message,
      ...(error.field ? { field: error.field } : {})
    });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Lỗi hệ thống không xác định." });
}
