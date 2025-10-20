import { Router } from "express";
import { PropertyController } from "../controllers/property.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { uploadMultiple } from "../middlewares/upload.middleware";

export class PropertyRouter {
  private router: Router;
  private propertyController: PropertyController;

  constructor() {
    this.router = Router();
    this.propertyController = new PropertyController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public routes
    this.router.get("/", this.propertyController.getProperties);
    this.router.get("/:id", this.propertyController.getPropertyById);

    // Tenant routes
    this.router.post(
      "/",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("TENANT"),
      uploadMultiple,
      this.propertyController.createProperty
    );

    this.router.put(
      "/:id",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("TENANT"),
      uploadMultiple,
      this.propertyController.updateProperty
    );

    this.router.delete(
      "/:id",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("TENANT"),
      this.propertyController.deleteProperty
    );

    this.router.get(
      "/tenant/my-properties",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("TENANT"),
      this.propertyController.getTenantProperties
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
