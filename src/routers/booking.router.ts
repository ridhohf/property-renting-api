import { Router } from "express";
import { BookingController } from "../controllers/booking.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";

export class BookingRouter {
  private router: Router;
  private bookingController: BookingController;

  constructor() {
    this.router = Router();
    this.bookingController = new BookingController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // User routes
    this.router.post(
      "/",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("USER"),
      this.bookingController.createBooking
    );

    this.router.post(
      "/:id/payment-proof",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("USER"),
      uploadSingle,
      this.bookingController.uploadPaymentProof
    );

    this.router.get(
      "/my-bookings",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("USER"),
      this.bookingController.getUserBookings
    );

    this.router.patch(
      "/:id/cancel",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("USER"),
      this.bookingController.cancelBooking
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
