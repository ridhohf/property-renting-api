import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  private authService = new AuthService();

  constructor() {
    this.register = this.register.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.login = this.login.bind(this);
    this.requestPasswordReset = this.requestPasswordReset.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.resendVerification = this.resendVerification.bind(this);
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.register(req.body);

      res.status(201).json({
        success: true,
        message:
          "Registration successful. Please check your email for verification.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      const result = await this.authService.verifyEmail(token, password);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await this.authService.requestPasswordReset(email);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      const result = await this.authService.resetPassword(token, password);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await this.authService.resendVerification(email);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
