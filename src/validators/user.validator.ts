import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters").optional(),
    phone: z.string().optional(),
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
  }),
});
