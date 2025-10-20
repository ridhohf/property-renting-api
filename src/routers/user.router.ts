import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";

export class UserRouter {
  private router: Router;
  private userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(AuthMiddleware.authenticate());

    this.router.get("/profile", this.userController.getProfile);

    this.router.put(
      "/profile",
      uploadSingle,
      this.userController.updateProfile
    );

    this.router.patch("/password", this.userController.updatePassword);
  }

  public getRouter(): Router {
    return this.router;
  }
}
