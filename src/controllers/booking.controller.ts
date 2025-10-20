import { Request, Response, NextFunction } from "express";
import { BookingService } from "../services/booking.service";
import { BookingStatus } from "@prisma/client";

export class BookingController {
  private bookingService = new BookingService();

  constructor() {
    this.createBooking = this.createBooking.bind(this);
    this.uploadPaymentProof = this.uploadPaymentProof.bind(this);
    this.getUserBookings = this.getUserBookings.bind(this);
    this.cancelBooking = this.cancelBooking.bind(this);
  }

  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const booking = await this.bookingService.createBooking(userId, req.body);

      res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadPaymentProof(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: "Payment proof image is required",
        });
        return;
      }

      const booking = await this.bookingService.uploadPaymentProof(
        id,
        userId,
        file
      );

      res.status(200).json({
        success: true,
        message: "Payment proof uploaded successfully",
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const status = req.query.status as BookingStatus | undefined;

      const bookings = await this.bookingService.getUserBookings(
        userId,
        status
      );

      res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const { reason } = req.body;

      const result = await this.bookingService.cancelBooking(
        id,
        userId,
        reason
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
