import { prisma } from "../config/database";
import { AppError } from "../utils/app.error";
import { UploadService } from "./upload.service";

interface PropertyFilter {
  city?: string;
  categoryId?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export class PropertyService {
  private uploadService = new UploadService();

  async getProperties(filters: PropertyFilter, userId?: string) {
    const {
      city,
      categoryId,
      checkIn,
      checkOut,
      guests,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = filters;

    const where: any = {
      isActive: true,
    };

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          category: true,
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
          rooms: {
            where: guests ? { capacity: { gte: guests } } : undefined,
            select: {
              id: true,
              name: true,
              basePrice: true,
              capacity: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPropertyById(propertyId: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        category: true,
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        rooms: {
          include: {
            peakSeasonRates: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!property) {
      throw new AppError("Property not found", 404);
    }

    return property;
  }

  async createProperty(
    tenantId: string,
    data: any,
    files?: Express.Multer.File[]
  ) {
    let images: string[] = [];

    if (files && files.length > 0) {
      images = await this.uploadService.uploadMultipleImages(
        files,
        "properties"
      );
    }

    const property = await prisma.property.create({
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        province: data.province,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        images,
        tenantId,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
      },
    });

    return property;
  }

  async updateProperty(
    propertyId: string,
    tenantId: string,
    data: any,
    files?: Express.Multer.File[]
  ) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new AppError("Property not found", 404);
    }

    if (property.tenantId !== tenantId) {
      throw new AppError("Unauthorized to update this property", 403);
    }

    let images = property.images;

    if (files && files.length > 0) {
      const newImages = await this.uploadService.uploadMultipleImages(
        files,
        "properties"
      );
      images = [...images, ...newImages];
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        province: data.province,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
        images,
        categoryId: data.categoryId,
        isActive: data.isActive,
      },
      include: {
        category: true,
      },
    });

    return updated;
  }

  async deleteProperty(propertyId: string, tenantId: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new AppError("Property not found", 404);
    }

    if (property.tenantId !== tenantId) {
      throw new AppError("Unauthorized to delete this property", 403);
    }

    await prisma.property.delete({
      where: { id: propertyId },
    });

    return { message: "Property deleted successfully" };
  }

  async getTenantProperties(tenantId: string) {
    const properties = await prisma.property.findMany({
      where: { tenantId },
      include: {
        category: true,
        rooms: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            capacity: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return properties;
  }
}
