import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app.error";

export class NotFoundMiddleware {
  static handle() {
    return (req: Request, res: Response, next: NextFunction) => {
      next(new AppError(`Route ${req.originalUrl} not found`, 404));
    };
  }
}
