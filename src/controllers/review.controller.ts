import { NextFunction, Request, Response } from "express";
import { ReviewService } from "../services/review.service";

export class ReviewController {
  private reviewService = new ReviewService();

  constructor() {
    this.createReview = this.createReview.bind(this);
    this.replyToReview = this.replyToReview.bind(this);
    this.getPropertyReviews = this.getPropertyReviews.bind(this);
  }

  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const review = await this.reviewService.createReview(userId, req.body);

      res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async replyToReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.userId;
      const { reply } = req.body;

      const review = await this.reviewService.replyToReview(
        id,
        tenantId,
        reply
      );

      res.status(200).json({
        success: true,
        message: "Reply added successfully",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPropertyReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { propertyId } = req.params;
      const reviews = await this.reviewService.getPropertyReviews(propertyId);

      res.status(200).json({
        success: true,
        message: "Reviews retrieved successfully",
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }
}
