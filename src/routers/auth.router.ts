import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { ValidationMiddleware } from "../middlewares/validation.middleware";
import {
    loginSchema,
    registerSchema,
    resetPasswordRequestSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from "../validators/auth.validator";

export class AuthRouter {
  private router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      "/register",
      ValidationMiddleware.validate(registerSchema),
      this.authController.register
    );

    this.router.post(
      "/verify-email",
      ValidationMiddleware.validate(verifyEmailSchema),
      this.authController.verifyEmail
    );

    this.router.post(
      "/login",
      ValidationMiddleware.validate(loginSchema),
      this.authController.login
    );

    this.router.post(
      "/request-reset-password",
      ValidationMiddleware.validate(resetPasswordRequestSchema),
      this.authController.requestPasswordReset
    );

    this.router.post(
      "/reset-password",
      ValidationMiddleware.validate(resetPasswordSchema),
      this.authController.resetPassword
    );

    this.router.post(
      "/resend-verification",
      this.authController.resendVerification
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
