// app/api/tenant/verify-email/route.ts
import { NextRequest } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/utils/db";
import {
  badRequest,
  notFound,
  internalError,
  validationError,
  success,
  ErrorCode,
  HttpStatus,
  type RequestContext,
} from "@/lib/utils/apiResponse";
import {
  verifyEmailService
} from "@/lib/services/auth/verify-email.service";
import { signToken } from "@/lib/utils/auth";
import {
  verifyOtpSchema,
  type VerifyOtpRequest,
} from "@/lib/validators/auth.validator";
import type { VerifyOtpResponse } from "@/lib/types";
import logger from "@/lib/utils/logger";

/**
 * POST /api/tenant/verify-email
 *
 * Verifies a tenant's email using OTP token
 *
 * ✅ When to use:
 *    - After tenant registration (user receives OTP via email)
 *    - Verify email and enable account access
 *    - Generate auth token for post-verification flow
 *
 * Request body: {
 *   email: string,    // Tenant email
 *   otp: string       // 6-digit OTP from email
 * }
 *
 * Response: success() with tenant data and auth token in httpOnly cookie
 */

export async function POST(req: NextRequest) {
  const context: RequestContext = {
    requestId: crypto.randomUUID(),
    userAgent: req.headers.get("user-agent") || undefined,
    ipAddress: req.headers.get("x-forwarded-for") || undefined,
  };

  const meta = {
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "1.0.0",
    requestId: context.requestId,
  };

  try {
    await connectDB();

    // ============================================================
    // STEP 1: Parse request body
    // ============================================================
    let body: VerifyOtpRequest;

    try {
      body = await req.json();
    } catch {
       logger.warn("Invalid JSON in verify-email request", {
        requestId: context.requestId,
        ip: context.ipAddress,
      });
      return badRequest(
        "Invalid JSON in request body",
        ErrorCode.VALIDATION_ERROR,
        { body: "Malformed JSON" },
        context
      );
    }

      logger.info("Verify email request received", {
      requestId: context.requestId,
      email: body.email,
      ip: context.ipAddress,
      userAgent: context.userAgent,
    });
    // ============================================================
    // STEP 2: Validate with Zod
    // ============================================================

    const parseResult = verifyOtpSchema.safeParse(body);
    if (!parseResult.success) {
       logger.warn("Verify email validation failed", {
        requestId: context.requestId,
        email: body.email,
        issues: parseResult.error.issues,
      });
      const fieldErrors: Record<string, string[]> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() || "form";
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      });

      return validationError(fieldErrors, "Invalid input", context);
    }

    const { email, otp } = parseResult.data;

    // ============================================================
    // STEP 3: Call verification service
    // ============================================================
    const result = await verifyEmailService({ email, otp });

      logger.info("Email verified successfully", {
      requestId: context.requestId,
      tenantId: result.tenant.id,
      email: result.tenant.email,
    });
    // ============================================================
    // STEP 4: Generate auth token
    // ============================================================
    const authToken = signToken(result.tenant.id);
 // tenant._id.toString()
    // ============================================================
    // STEP 5: Build response
    // ============================================================
    const responseBody: VerifyOtpResponse = {
      tenant: result.tenant,
    };

    const response = success(responseBody, "Email verified successfully", HttpStatus.OK, meta);

    // ============================================================
    // STEP 6: Set authentication cookie (httpOnly for security)
    // ============================================================
    response.cookies.set("auth-token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 1 day
      path: "/",
    });

    // ============================================================
    // STEP 7: Add security headers
    // ============================================================
    response.headers.set("X-Auth-Type", "JWT");
    response.headers.set("X-Tenant-Id", result.tenant.id);

    return response;
  } catch (error: unknown) {
     logger.error("Email verification route failed", {
      requestId: context.requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // ============================================================
    // Map known service errors to proper responses
    // ============================================================
    if ((error as any)?.code === "INVALID_OTP") {
      return badRequest(
        "Invalid OTP",
        ErrorCode.INVALID_OPERATION,
        (error as any)?.details,
        context
      );
    }

    if ((error as any)?.code === "OTP_EXPIRED") {
      return badRequest(
        "OTP has expired",
        ErrorCode.INVALID_OPERATION,
        (error as any)?.details,
        context
      );
    }

    if ((error as any)?.code === "TENANT_NOT_FOUND") {
      return notFound(
        "Tenant not found",
        ErrorCode.NOT_FOUND,
        (error as any)?.details,
        context
      );
    }

    // ============================================================
    // Unexpected error → internal error
    // ============================================================
    return internalError(
      "Failed to verify email",
      ErrorCode.INTERNAL_ERROR,
      {
        message: error instanceof Error ? error.message : "Unexpected error",
        ...(error instanceof Error && { stack: error.stack }),
      },
      context
    );
  }
}