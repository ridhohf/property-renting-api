import { BookingStatus } from "@prisma/client";
import cron from "node-cron";
import { prisma } from "../config/database";
import { EmailService } from "../services/email.service";
import { LoggerService } from "../utils/logger";

const emailService = new EmailService();
const logger = new LoggerService();

// Run every day at 10:00 AM
cron.schedule("0 10 * * *", async () => {
  try {
    logger.info("Running booking reminder job");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const bookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.CONFIRMED,
        checkInDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
      },
      include: {
        user: true,
        room: {
          include: { property: true },
        },
      },
    });

    for (const booking of bookings) {
      await emailService.sendBookingReminder(booking.user.email, {
        propertyName: booking.room.property.name,
        roomName: booking.room.name,
        checkIn: booking.checkInDate.toLocaleDateString(),
        address: booking.room.property.address,
      });
    }

    logger.info(`Sent ${bookings.length} booking reminders`);
  } catch (error) {
    logger.error("Booking reminder job failed", error);
  }
});
