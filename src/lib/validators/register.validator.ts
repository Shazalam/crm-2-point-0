// lib/validation/tenant.ts
import { z } from "zod";

export const registerTenantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/\d/, "Must contain a number")
    .regex(/[@$!%*?&]/, "Must contain a special character (@$!%*?&)"),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^[+\d][\d\s-]{6,}$/.test(val),
      "Please enter a valid phone number"
    ),

});

export type RegisterTenantFormValues = z.infer<typeof registerTenantSchema>;


/**
 * Validate and parse input
 */
// export function validateCreateTenant(input: unknown) {
//   return RegisterTenantFormValues.safeParse(input);
// }
