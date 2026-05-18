import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().optional(),
  password: z.string().min(8).max(128).optional(),
});

/** First admin bootstrap — same fields as register */
export const setupAdminSchema = registerSchema;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SetupAdminInput = z.infer<typeof setupAdminSchema>;
