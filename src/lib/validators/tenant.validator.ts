// lib/validators/tenant.validator.ts
import { z } from 'zod';

/**
 * Validation schema for tenant registration
 */
export const createTenantSchema = z.object({
  name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters')
    .trim(),
  
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
});

/**
 * Type inference from schema
 */
export type CreateTenantInput = z.infer<typeof createTenantSchema>;

/**
 * Validate and parse input
 */
export function validateCreateTenant(input: unknown) {
  return createTenantSchema.safeParse(input);
}
