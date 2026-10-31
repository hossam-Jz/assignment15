import { NextFunction, Request, Response } from "express";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

export const limiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 2 minutes
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req: Request, res: Response, _next: NextFunction) => {
    res.status(429).json({
      message: "Too many requests, please try again later.",
    });
  },
});
