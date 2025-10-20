import { prisma } from "../config/database";
import { AppError } from "../utils/app.error";
import { UploadService } from "./upload.service";

export class RoomService {
  private uploadService = new UploadService();

  async createRoom(
    propertyId: string,
    tenantId: string,
    data: any,
    files?: Express.Multer.File[]
  ) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.tenantId !== tenantId) {
      throw new AppError("Property not found or unauthorized", 403);
    }

    let images: string[] = [];
    if (files && files.length > 0) {
      images = await this.uploadService.uploadMultipleImages(files, "rooms");
    }

    const room = await prisma.room.create({
      data: {
        propertyId,
        name: data.name,
        description: data.description,
        basePrice: parseFloat(data.basePrice),
        capacity: parseInt(data.capacity),
        images,
      },
    });

    return room;
  }

  async updateRoom(
    roomId: string,
    tenantId: string,
    data: any,
    files?: Express.Multer.File[]
  ) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { property: true },
    });

    if (!room || room.property.tenantId !== tenantId) {
      throw new AppError("Room not found or unauthorized", 403);
    }

    let images = room.images;
    if (files && files.length > 0) {
      const newImages = await this.uploadService.uploadMultipleImages(
        files,
        "rooms"
      );
      images = [...images, ...newImages];
    }

    const updated = await prisma.room.update({
      where: { id: roomId },
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice ? parseFloat(data.basePrice) : undefined,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
        images,
      },
    });

    return updated;
  }

  async deleteRoom(roomId: string, tenantId: string) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { property: true },
    });

    if (!room || room.property.tenantId !== tenantId) {
      throw new AppError("Room not found or unauthorized", 403);
    }

    await prisma.room.delete({ where: { id: roomId } });
    return { message: "Room deleted successfully" };
  }

  async setPeakSeasonRate(roomId: string, tenantId: string, data: any) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { property: true },
    });

    if (!room || room.property.tenantId !== tenantId) {
      throw new AppError("Room not found or unauthorized", 403);
    }

    const peakRate = await prisma.peakSeasonRate.create({
      data: {
        roomId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        adjustmentType: data.adjustmentType,
        adjustmentValue: parseFloat(data.adjustmentValue),
        reason: data.reason,
      },
    });

    return peakRate;
  }

  async updatePeakSeasonRate(rateId: string, tenantId: string, data: any) {
    const rate = await prisma.peakSeasonRate.findUnique({
      where: { id: rateId },
      include: { room: { include: { property: true } } },
    });

    if (!rate || rate.room.property.tenantId !== tenantId) {
      throw new AppError("Peak season rate not found or unauthorized", 403);
    }

    const updated = await prisma.peakSeasonRate.update({
      where: { id: rateId },
      data: {
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        adjustmentType: data.adjustmentType,
        adjustmentValue: data.adjustmentValue
          ? parseFloat(data.adjustmentValue)
          : undefined,
        reason: data.reason,
      },
    });

    return updated;
  }

  async deletePeakSeasonRate(rateId: string, tenantId: string) {
    const rate = await prisma.peakSeasonRate.findUnique({
      where: { id: rateId },
      include: { room: { include: { property: true } } },
    });

    if (!rate || rate.room.property.tenantId !== tenantId) {
      throw new AppError("Peak season rate not found or unauthorized", 403);
    }

    await prisma.peakSeasonRate.delete({ where: { id: rateId } });
    return { message: "Peak season rate deleted successfully" };
  }

  async setRoomAvailability(roomId: string, tenantId: string, data: any) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { property: true },
    });

    if (!room || room.property.tenantId !== tenantId) {
      throw new AppError("Room not found or unauthorized", 403);
    }

    const availability = await prisma.roomAvailability.upsert({
      where: {
        roomId_date: {
          roomId,
          date: new Date(data.date),
        },
      },
      update: {
        isAvailable: data.isAvailable,
      },
      create: {
        roomId,
        date: new Date(data.date),
        isAvailable: data.isAvailable,
      },
    });

    return availability;
  }
}
