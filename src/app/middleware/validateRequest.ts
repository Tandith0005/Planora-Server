import { NextFunction, Request, Response } from "express";
import { ZodError, ZodObject } from "zod";
import status from "http-status";
import AppError from "../utils/AppError.js";

export const validateRequest = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const zodError = error as ZodError;

        const errorMessage = zodError.issues
          .map((err: any) => err.message)
          .join(", ");

        
        throw new AppError(errorMessage, status.BAD_REQUEST);
      }

      // If it's not a Zod error, pass it forward
      next(error);
    }
  };
};