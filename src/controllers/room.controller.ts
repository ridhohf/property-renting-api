import { NextFunction, Request, Response } from "express";
import { PricingService } from "../services/pricing.service";
import { RoomService } from "../services/room.service";

export class RoomController {
  private roomService = new RoomService();
  private pricingService = new PricingService();

  constructor() {
    this.createRoom = this.createRoom.bind(this);
    this.updateRoom = this.updateRoom.bind(this);
    this.deleteRoom = this.deleteRoom.bind(this);
    this.setPeakSeasonRate = this.setPeakSeasonRate.bind(this);
    this.updatePeakSeasonRate = this.updatePeakSeasonRate.bind(this);
    this.deletePeakSeasonRate = this.deletePeakSeasonRate.bind(this);
    this.setRoomAvailability = this.setRoomAvailability.bind(this);
    this.getRoomPrices = this.getRoomPrices.bind(this);
  }

  async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { propertyId } = req.params;
      const tenantId = req.user!.userId;
      const files = req.files as Express.Multer.File[];

      const room = await this.roomService.createRoom(
        propertyId,
        tenantId,
        req.body,
        files
      );

      res.status(201).json({
        success: true,
        message: "Room created successfully",
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.userId;
      const files = req.files as Express.Multer.File[];

      const room = await this.roomService.updateRoom(
        id,
        tenantId,
        req.body,
        files
      );

      res.status(200).json({
        success: true,
        message: "Room updated successfully",
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.userId;

      const result = await this.roomService.deleteRoom(id, tenantId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async setPeakSeasonRate(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const tenantId = req.user!.userId;

      const rate = await this.roomService.setPeakSeasonRate(
        roomId,
        tenantId,
        req.body
      );

      res.status(201).json({
        success: true,
        message: "Peak season rate created successfully",
        data: rate,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePeakSeasonRate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.userId;

      const rate = await this.roomService.updatePeakSeasonRate(
        id,
        tenantId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Peak season rate updated successfully",
        data: rate,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePeakSeasonRate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.userId;

      const result = await this.roomService.deletePeakSeasonRate(id, tenantId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async setRoomAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const tenantId = req.user!.userId;

      const availability = await this.roomService.setRoomAvailability(
        roomId,
        tenantId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Room availability updated successfully",
        data: availability,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoomPrices(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const { year, month } = req.query;

      const prices = await this.pricingService.getRoomPricesForMonth(
        roomId,
        parseInt(year as string),
        parseInt(month as string)
      );

      res.status(200).json({
        success: true,
        message: "Room prices retrieved successfully",
        data: prices,
      });
    } catch (error) {
      next(error);
    }
  }
}
