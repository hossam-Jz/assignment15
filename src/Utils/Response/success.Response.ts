import { Response } from "express";

interface ISuccessResponses {
  res: Response;
  message?: string;
  statusCode?: number;
  data?: unknown;
}

export const successResponses = ({
  res,
  message = "Done",
  statusCode = 200,
  data,
}: ISuccessResponses): Response => {
  return res.status(statusCode).json({
    message,
    data,
  });
};
