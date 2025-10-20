import App from "./app";
import { Database } from "./config/database";
import { LoggerService } from "./utils/logger";
import "./jobs/booking-reminder.job";
import "./jobs/cancel-unpaid.job";

const logger = new LoggerService();

const main = () => {
  try {
    const app = new App();
    app.start();

    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received, shutting down gracefully");
      await Database.disconnect();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT received, shutting down gracefully");
      await Database.disconnect();
      process.exit(0);
    });
  } catch (error) {
    logger.error("Failed to start application", error);
    process.exit(1);
  }
};

main();
