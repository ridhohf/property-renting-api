import { PrismaClient } from "@prisma/client";
import { LoggerService } from "../utils/logger";

const logger = new LoggerService();

export class Database {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: ["query", "error", "warn"],
      });

      Database.instance
        .$connect()
        .then(() => logger.info("Database connected successfully"))
        .catch((error) => {
          logger.error("Database connection failed", error);
          process.exit(1);
        });
    }

    return Database.instance;
  }

  public static async disconnect(): Promise<void> {
    if (Database.instance) {
      await Database.instance.$disconnect();
      logger.info("Database disconnected");
    }
  }
}

export const prisma = Database.getInstance();
