import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class CategoryRouter {
  private router: Router;
  private categoryController: CategoryController;

  constructor() {
    this.router = Router();
    this.categoryController = new CategoryController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public routes
    this.router.get("/", this.categoryController.getCategories);
    this.router.get("/:id", this.categoryController.getCategoryById);

    // Tenant routes
    this.router.post(
      "/",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("TENANT"),
      this.categoryController.createCategory
    );

    this.router.put(
      "/:id",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("TENANT"),
      this.categoryController.updateCategory
    );

    this.router.delete(
      "/:id",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("TENANT"),
      this.categoryController.deleteCategory
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
