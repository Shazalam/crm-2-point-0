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

export const loginTenantSchema = z.object({
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
});

export type LoginTenantFormValues = z.infer<typeof loginTenantSchema>;

// Zod schema for OTP verification request
export const verifyOtpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^[0-9]+$/, 'OTP must be numeric'),
});

export type VerifyOtpRequest = z.infer<typeof verifyOtpSchema>;

export const resendOtpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export type ResendOtpData = z.infer<typeof resendOtpSchema>;
