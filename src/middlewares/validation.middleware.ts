import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { AppError } from "../utils/app.error";

export class ValidationMiddleware {
  static validate(schema: ZodTypeAny) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        next();
      } catch (err: unknown) {
        if (err instanceof ZodError) {
          const messages = err.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          }));

          return next(new AppError(JSON.stringify(messages), 400));
        }
        next(err);
      }
    };
  }
}
