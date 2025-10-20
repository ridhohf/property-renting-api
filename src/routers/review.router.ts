import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class ReviewRouter {
  private router: Router;
  private reviewController: ReviewController;

  constructor() {
    this.router = Router();
    this.reviewController = new ReviewController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/property/:propertyId",
      this.reviewController.getPropertyReviews
    );

    this.router.post(
      "/",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("USER"),
      this.reviewController.createReview
    );

    this.router.post(
      "/:id/reply",
      AuthMiddleware.authenticate(),
      AuthMiddleware.authorize("TENANT"),
      this.reviewController.replyToReview
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
