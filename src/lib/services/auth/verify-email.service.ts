// lib/services/auth/verify-email.service.ts
import { Tenant, VerificationToken } from "@/lib/models";
import type { ITenantResponse } from "@/lib/types";

export interface VerifyEmailServiceInput {
  email: string;
  otp: string;
}

export interface VerifyEmailServiceOutput {
  tenant: ITenantResponse;
  verifiedAt: string;
}

/**
 * Service to verify email via OTP token
 * Handles:
 * - Finding and validating OTP token
 * - Checking token expiration
 * - Marking tenant as verified
 * - Cleaning up used token
 * - Returning safe tenant response
 *
 * @throws {Error} with code property for different error scenarios
 */
export async function verifyEmailService(
  input: VerifyEmailServiceInput
): Promise<VerifyEmailServiceOutput> {
  const { email, otp } = input;
  const normalizedEmail = email.toLowerCase();

  // ============================================================
  // Step 1: Find verification token
  // ============================================================
  const token = await VerificationToken.findOne({
    email: normalizedEmail,
    otp: otp,
  });

  if (!token) {
    const error = new Error("Invalid OTP");
    (error as any).code = "INVALID_OTP";
    (error as any).details = {
      suggestion: "Please request a new OTP if this one has expired",
    };
    throw error;
  }

  // ============================================================
  // Step 2: Check token expiration
  // ============================================================
  if (token.expires < new Date()) {
    // Clean up expired token
    await VerificationToken.deleteOne({ _id: token._id });

    const error = new Error("OTP has expired");
    (error as any).code = "OTP_EXPIRED";
    (error as any).details = {
      suggestion: "Please request a new OTP",
    };
    throw error;
  }

  // ============================================================
  // Step 3: Find tenant
  // ============================================================
  const tenant = await Tenant.findOne({ email: normalizedEmail });

  if (!tenant) {
    const error = new Error("Tenant not found");
    (error as any).code = "TENANT_NOT_FOUND";
    (error as any).details = { email: normalizedEmail };
    throw error;
  }

  // ============================================================
  // Step 4: Mark tenant as verified
  // ============================================================
  tenant.emailVerified = true;
  await tenant.save();

  // ============================================================
  // Step 5: Clean up used token
  // ============================================================
  await VerificationToken.deleteOne({ _id: token._id });

  // ============================================================
  // Step 6: Build and return safe tenant response
  // ============================================================
  const verifiedAt = new Date().toISOString();

  const tenantResponse: ITenantResponse = {
    id: tenant._id.toString(),
    name: tenant.name,
    email: tenant.email,
    phoneNumber: tenant.phoneNumber,
    emailVerified: tenant.emailVerified,
    slug: tenant.slug,
    createdAt: tenant.createdAt.toISOString(),
  };

  return {
    tenant: tenantResponse,
    verifiedAt,
  };
}