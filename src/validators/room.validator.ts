import { z } from "zod";

export const createRoomSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Room name must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
    capacity: z.string().regex(/^\d+$/, "Capacity must be a number"),
  }),
});

export const peakSeasonRateSchema = z.object({
  body: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    adjustmentType: z.enum(["PERCENTAGE", "FIXED"]),
    adjustmentValue: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Invalid value format"),
    reason: z.string().optional(),
  }),
});
