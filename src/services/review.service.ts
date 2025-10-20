import { prisma } from "../config/database";
import { AppError } from "../utils/app.error";
import { BookingStatus } from "@prisma/client";

export class ReviewService {
  async createReview(userId: string, data: any) {
    const { bookingId, rating, comment } = data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        room: {
          include: { property: true },
        },
      },
    });

    if (!booking || booking.userId !== userId) {
      throw new AppError("Booking not found or unauthorized", 403);
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new AppError("Can only review after checkout", 400);
    }

    const currentDate = new Date();
    if (booking.checkOutDate > currentDate) {
      throw new AppError("Cannot review before checkout date", 400);
    }

    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      throw new AppError("Review already exists for this booking", 400);
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        userId,
        propertyId: booking.room.property.id,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });

    return review;
  }

  async replyToReview(reviewId: string, tenantId: string, reply: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        property: true,
      },
    });

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.property.tenantId !== tenantId) {
      throw new AppError("Unauthorized to reply to this review", 403);
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        reply,
        repliedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });

    return updated;
  }

  async getPropertyReviews(propertyId: string) {
    const reviews = await prisma.review.findMany({
      where: { propertyId },
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
    });

    return reviews;
  }
}
