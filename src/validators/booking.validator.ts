import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    roomId: z.string().uuid("Invalid room ID"),
    checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    checkOutDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    guests: z.number().int().min(1, "At least 1 guest required"),
  }),
});

export const cancelBookingSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }),
});
