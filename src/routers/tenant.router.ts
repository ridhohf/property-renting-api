import { Router } from "express";
import { TenantController } from "../controllers/tenant.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class TenantRouter {
  private router: Router;
  private tenantController: TenantController;

  constructor() {
    this.router = Router();
    this.tenantController = new TenantController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All routes require tenant authentication
    this.router.use(AuthMiddleware.authenticate());
    this.router.use(AuthMiddleware.authorize("TENANT"));

    this.router.get("/bookings", this.tenantController.getTenantBookings);
    this.router.patch(
      "/bookings/:id/confirm",
      this.tenantController.confirmPayment
    );
    this.router.patch(
      "/bookings/:id/reject",
      this.tenantController.rejectPayment
    );
    this.router.get("/reports/sales", this.tenantController.getSalesReport);
  }

  public getRouter(): Router {
    return this.router;
  }
}
