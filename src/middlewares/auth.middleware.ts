import { UserRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app.error";
import { JwtUtil } from "../utils/jwt.util";

export class AuthMiddleware {
  static authenticate() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          throw new AppError("No token provided", 401);
        }

        const token = authHeader.substring(7);
        const payload = JwtUtil.verifyToken(token);

        req.user = {
          userId: payload.userId,
          email: payload.email,
          role: payload.role as UserRole,
        };

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  static authorize(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new AppError("Unauthorized", 401));
      }

      if (!roles.includes(req.user.role)) {
        return next(new AppError("Forbidden: Insufficient permissions", 403));
      }

      next();
    };
  }
}
