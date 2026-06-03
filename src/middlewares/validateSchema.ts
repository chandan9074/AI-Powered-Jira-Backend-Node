// src/middlewares/validateSchema.ts
import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject) => 
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate the request body, query, and params against the schema
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      next(); // If validation passes, proceed to the controller
    } catch (error) {
      if (error instanceof ZodError) {
        // Format the Zod errors into a clean, readable array for the frontend
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: formattedErrors,
        });
        return;
      }
      
      next(error); // Pass non-Zod errors to the global error handler
    }
  };