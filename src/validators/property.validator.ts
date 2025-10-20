import { z } from "zod";

export const createPropertySchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    province: z.string().min(2, "Province is required"),
    categoryId: z.string().uuid("Invalid category ID"),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
  }),
});

export const updatePropertySchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    address: z.string().min(5).optional(),
    city: z.string().min(2).optional(),
    province: z.string().min(2).optional(),
    categoryId: z.string().uuid().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
