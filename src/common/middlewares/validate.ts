/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "yup";
import { ValidationError } from "yup";
import response from "./../../utils/response";

declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
    }
  }
}

export default (validator: ObjectSchema<any>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedBody = await validator.validate(req.body, {
        abortEarly: false,
      });
      req.validatedBody = validatedBody;
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        response(res, 400, "ValidationError", err.errors);
        return;
      }
      next(err);
    }
  };
