import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  private userService = new UserService();

  constructor() {
    this.getProfile = this.getProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await this.userService.getProfile(userId);

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const file = req.file;

      const user = await this.userService.updateProfile(userId, req.body, file);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;

      const result = await this.userService.updatePassword(
        userId,
        currentPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
