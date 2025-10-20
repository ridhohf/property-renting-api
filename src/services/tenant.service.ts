import { BookingStatus } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../utils/app.error";
import { EmailService } from "./email.service";

export class TenantService {
  private emailService = new EmailService();

  async getTenantBookings(tenantId: string, status?: BookingStatus) {
    const where: any = {
      room: {
        property: {
          tenantId,
        },
      },
    };

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        room: {
          include: {
            property: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return bookings;
  }

  async confirmPayment(bookingId: string, tenantId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        room: {
          include: { property: true },
        },
        user: true,
      },
    });

    if (!booking || booking.room.property.tenantId !== tenantId) {
      throw new AppError("Booking not found or unauthorized", 403);
    }

    if (booking.status !== BookingStatus.WAITING_CONFIRMATION) {
      throw new AppError("Cannot confirm this booking", 400);
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED },
      include: {
        room: { include: { property: true } },
        user: true,
      },
    });

    // Send confirmation email
    await this.emailService.sendBookingConfirmation(booking.user.email, {
      propertyName: booking.room.property.name,
      roomName: booking.room.name,
      checkIn: booking.checkInDate.toLocaleDateString(),
      checkOut: booking.checkOutDate.toLocaleDateString(),
      totalPrice: booking.totalPrice.toString(),
    });

    return updated;
  }

  async rejectPayment(bookingId: string, tenantId: string, reason?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        room: {
          include: { property: true },
        },
      },
    });

    if (!booking || booking.room.property.tenantId !== tenantId) {
      throw new AppError("Booking not found or unauthorized", 403);
    }

    if (booking.status !== BookingStatus.WAITING_CONFIRMATION) {
      throw new AppError("Cannot reject this booking", 400);
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.WAITING_PAYMENT,
        cancellationReason: reason,
        paymentProof: null,
        paymentProofUploadedAt: null,
      },
    });

    return updated;
  }

  async getSalesReport(tenantId: string, filters: any) {
    const { startDate, endDate, propertyId } = filters;

    const where: any = {
      room: {
        property: {
          tenantId,
          ...(propertyId && { id: propertyId }),
        },
      },
      status: BookingStatus.CONFIRMED,
    };

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: {
          include: { property: true },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice),
      0
    );

    return {
      bookings,
      summary: {
        totalBookings: bookings.length,
        totalRevenue,
      },
    };
  }
}
