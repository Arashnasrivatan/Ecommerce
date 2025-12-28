import { Request, Response, NextFunction } from 'express';
import configs from './../../config/configs';

export const setHeaders = (req: Request ,res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', configs.cors);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
};
