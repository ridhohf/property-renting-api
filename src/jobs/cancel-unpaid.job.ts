import { BookingStatus } from "@prisma/client";
import cron from "node-cron";
import { prisma } from "../config/databse";
import { LoggerService } from "../utils/logger";

const logger = new LoggerService();

// Run every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  try {
    logger.info("Running cancel unpaid bookings job");

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.WAITING_PAYMENT,
        createdAt: {
          lt: oneHourAgo,
        },
      },
    });

    if (expiredBookings.length > 0) {
      await prisma.booking.updateMany({
        where: {
          id: {
            in: expiredBookings.map((b) => b.id),
          },
        },
        data: {
          status: BookingStatus.CANCELLED,
          cancellationReason: "Payment not received within 1 hour",
        },
      });

      logger.info(`Cancelled ${expiredBookings.length} unpaid bookings`);
    }
  } catch (error) {
    logger.error("Cancel unpaid bookings job failed", error);
  }
});
