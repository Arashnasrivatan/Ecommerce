import { Response } from "express";
import { IResponse } from "../common/types/response";

const response = <T>(
  res: Response,
  statusCode: number,
  message?: string | null,
  data?: T
): Response<IResponse<T>> => {
  const responseObject: IResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    statusCode,
  };

  if (message) {
    responseObject.message = message;
  }

  if (data) {
    responseObject.data = data;
  }

  return res.status(statusCode).json(responseObject);
};

export default response;
