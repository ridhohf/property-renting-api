import { NextFunction, Request, Response } from "express";
import { PropertyService } from "../services/property.service";

export class PropertyController {
  private propertyService = new PropertyService();

  constructor() {
    this.getProperties = this.getProperties.bind(this);
    this.getPropertyById = this.getPropertyById.bind(this);
    this.createProperty = this.createProperty.bind(this);
    this.updateProperty = this.updateProperty.bind(this);
    this.deleteProperty = this.deleteProperty.bind(this);
    this.getTenantProperties = this.getTenantProperties.bind(this);
  }

  async getProperties(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        city: req.query.city as string,
        categoryId: req.query.categoryId as string,
        checkIn: req.query.checkIn
          ? new Date(req.query.checkIn as string)
          : undefined,
        checkOut: req.query.checkOut
          ? new Date(req.query.checkOut as string)
          : undefined,
        guests: req.query.guests
          ? parseInt(req.query.guests as string)
          : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await this.propertyService.getProperties(
        filters,
        req.user?.userId
      );

      res.status(200).json({
        success: true,
        message: "Properties retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPropertyById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const property = await this.propertyService.getPropertyById(id);

      res.status(200).json({
        success: true,
        message: "Property retrieved successfully",
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  async createProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.userId;
      const files = req.files as Express.Multer.File[];

      const property = await this.propertyService.createProperty(
        tenantId,
        req.body,
        files
      );

      res.status(201).json({
        success: true,
        message: "Property created successfully",
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.userId;
      const files = req.files as Express.Multer.File[];

      const property = await this.propertyService.updateProperty(
        id,
        tenantId,
        req.body,
        files
      );

      res.status(200).json({
        success: true,
        message: "Property updated successfully",
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.userId;

      const result = await this.propertyService.deleteProperty(id, tenantId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTenantProperties(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.userId;
      const properties =
        await this.propertyService.getTenantProperties(tenantId);

      res.status(200).json({
        success: true,
        message: "Tenant properties retrieved successfully",
        data: properties,
      });
    } catch (error) {
      next(error);
    }
  }
}
