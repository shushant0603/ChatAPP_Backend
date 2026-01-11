import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be too long")
      .regex(/^[a-zA-Z ]+$/, "Name can only contain letters"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email format"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password must be max 32 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[@$!%*?&#]/, "Password must contain one special character"),
  }),
});
