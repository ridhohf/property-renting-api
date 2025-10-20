import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid("Invalid booking ID"),
    rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
    comment: z.string().min(10, "Comment must be at least 10 characters"),
  }),
});

export const replyReviewSchema = z.object({
  body: z.object({
    reply: z.string().min(10, "Reply must be at least 10 characters"),
  }),
});
