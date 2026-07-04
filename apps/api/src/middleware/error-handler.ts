import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(422).json({
      error: "Validation failed",
      details: error.flatten()
    });
  }

  const status = typeof error.status === "number" ? error.status : 500;
  return res.status(status).json({
    error: status === 500 ? "Internal server error" : error.message
  });
};
