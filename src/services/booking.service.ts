import { BookingStatus } from "@prisma/client";
import { prisma } from "../config/databse";
import { AppError } from "../utils/app.error";
import { EmailService } from "./email.service";
import { PricingService } from "./pricing.service";
import { UploadService } from "./upload.service";

export class BookingService {
  private pricingService = new PricingService();
  private emailService = new EmailService();
  private uploadService = new UploadService();

  async createBooking(userId: string, data: any) {
    const { roomId, checkInDate, checkOutDate, guests } = data;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { property: true },
    });

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    if (guests > room.capacity) {
      throw new AppError("Number of guests exceeds room capacity", 400);
    }

    // Check room availability
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const existingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: { notIn: [BookingStatus.CANCELLED] },
        OR: [
          {
            AND: [
              { checkInDate: { lte: checkIn } },
              { checkOutDate: { gt: checkIn } },
            ],
          },
          {
            AND: [
              { checkInDate: { lt: checkOut } },
              { checkOutDate: { gte: checkOut } },
            ],
          },
        ],
      },
    });

    if (existingBookings.length > 0) {
      throw new AppError("Room is not available for selected dates", 400);
    }

    const totalPrice = await this.pricingService.calculatePrice(
      roomId,
      checkIn,
      checkOut
    );

    const booking = await prisma.booking.create({
      data: {
        userId,
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalPrice,
        guests,
        status: BookingStatus.WAITING_PAYMENT,
      },
      include: {
        room: {
          include: { property: true },
        },
      },
    });

    return booking;
  }

  async uploadPaymentProof(
    bookingId: string,
    userId: string,
    file: Express.Multer.File
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.userId !== userId) {
      throw new AppError("Booking not found or unauthorized", 403);
    }

    if (booking.status !== BookingStatus.WAITING_PAYMENT) {
      throw new AppError("Cannot upload payment proof for this booking", 400);
    }

    const paymentProof = await this.uploadService.uploadImage(file, "payments");

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentProof,
        paymentProofUploadedAt: new Date(),
        status: BookingStatus.WAITING_CONFIRMATION,
      },
    });

    return updated;
  }

  async getUserBookings(userId: string, status?: BookingStatus) {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: {
          include: { property: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return bookings;
  }

  async cancelBooking(bookingId: string, userId: string, reason?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.userId !== userId) {
      throw new AppError("Booking not found or unauthorized", 403);
    }

    if (booking.status === BookingStatus.WAITING_PAYMENT) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELLED,
          cancellationReason: reason,
        },
      });

      return { message: "Booking cancelled successfully" };
    }

    throw new AppError("Cannot cancel booking after payment", 400);
  }
}
