import { BookingStatus } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/tenant.service";

export class TenantController {
  private tenantService = new TenantService();

  constructor() {
    this.getTenantBookings = this.getTenantBookings.bind(this);
    this.confirmPayment = this.confirmPayment.bind(this);
    this.rejectPayment = this.rejectPayment.bind(this);
    this.getSalesReport = this.getSalesReport.bind(this);
  }

  async getTenantBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.userId;
      const status = req.query.status as BookingStatus | undefined;

      const bookings = await this.tenantService.getTenantBookings(
        tenantId,
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

  async confirmPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.userId;

      const booking = await this.tenantService.confirmPayment(id, tenantId);

      res.status(200).json({
        success: true,
        message: "Payment confirmed successfully",
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.userId;
      const { reason } = req.body;

      const booking = await this.tenantService.rejectPayment(
        id,
        tenantId,
        reason
      );

      res.status(200).json({
        success: true,
        message: "Payment rejected successfully",
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.userId;
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        propertyId: req.query.propertyId as string,
      };

      const report = await this.tenantService.getSalesReport(tenantId, filters);

      res.status(200).json({
        success: true,
        message: "Sales report retrieved successfully",
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }
}
