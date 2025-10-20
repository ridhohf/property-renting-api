import { Router } from "express";
import { AuthRouter } from "./auth.router";
import { BookingRouter } from "./booking.router";
import { CategoryRouter } from "./category.router";
import { PropertyRouter } from "./property.router";
import { ReviewRouter } from "./review.router";
import { RoomRouter } from "./room.router";
import { TenantRouter } from "./tenant.router";
import { UserRouter } from "./user.router";

export class MainRouter {
  private router: Router;
  private authRouter: AuthRouter;
  private propertyRouter: PropertyRouter;
  private bookingRouter: BookingRouter;
  private tenantRouter: TenantRouter;
  private userRouter: UserRouter;
  private roomRouter: RoomRouter;
  private reviewRouter: ReviewRouter;
  private categoryRouter: CategoryRouter;

  constructor() {
    this.router = Router();
    this.authRouter = new AuthRouter();
    this.propertyRouter = new PropertyRouter();
    this.bookingRouter = new BookingRouter();
    this.tenantRouter = new TenantRouter();
    this.userRouter = new UserRouter();
    this.roomRouter = new RoomRouter();
    this.reviewRouter = new ReviewRouter();
    this.categoryRouter = new CategoryRouter();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use("/api/auth", this.authRouter.getRouter());
    this.router.use("/api/properties", this.propertyRouter.getRouter());
    this.router.use("/api/bookings", this.bookingRouter.getRouter());
    this.router.use("/api/tenant", this.tenantRouter.getRouter());
    this.router.use("/api/users", this.userRouter.getRouter());
    this.router.use("/api/rooms", this.roomRouter.getRouter());
    this.router.use("/api/reviews", this.reviewRouter.getRouter());
    this.router.use("/api/categories", this.categoryRouter.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}
