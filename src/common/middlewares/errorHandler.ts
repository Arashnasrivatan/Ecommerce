import { Request, Response } from "express";
import response from "../../utils/response";
import logger from "../../utils/logger";
import configs from './../../config/configs';

export interface CustomError extends Error {
  status?: number;
  code?: string;
  errors?: Record<string, unknown> | null;
  isOperational?: boolean;
}

const isProd = configs.nodeEnv === "production";

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response): Response | void => {
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || null;

  //* Logging
  const baseLog = `${req.method} ${req.originalUrl} - ${status} - ${message}`;

  // Development
  if (!isProd) {
    console.error(`❌ [DEV ERROR]`, err);
    logger.error(`[DEV] ${baseLog}`);
    if (err.stack) logger.error(err.stack);
  } 
  // Production
  else {
    if (err.isOperational) {
      logger.warn(`[Operational] ${baseLog}`);
    } else {
      logger.error(`[Unhandled Exception] ${baseLog}`);
      if (err.stack) logger.error(err.stack);
    }
  }

  const responseBody: Record<string, unknown> = {};

  if (errors) responseBody.errors = errors;

  if (!isProd) {
    responseBody.stack = err.stack;
    responseBody.path = req.originalUrl;
    responseBody.method = req.method;
  }

  return response(res, status, message, responseBody);
};

export default errorHandler;
