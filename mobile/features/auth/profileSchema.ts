import { z } from "zod";

export const updateProfileFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasPassword = Boolean(data.password?.trim());
    const hasConfirm = Boolean(data.confirmPassword?.trim());

    if (hasPassword && (data.password?.length ?? 0) < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must be at least 8 characters",
        path: ["password"],
      });
    }

    if (hasPassword && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }

    if (hasConfirm && !hasPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a new password",
        path: ["password"],
      });
    }
  });

export type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;
