import { NextRequest } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/utils/db";
import {
  accepted,
  badRequest,
  internalError,
  notFound,
  validationError,
  ErrorCode,
  type RequestContext,
} from "@/lib/utils/apiResponse";
import { resendOtpSchema, type ResendOtpData } from "@/lib/validators/auth.validator";
import { resendOtpService } from "@/lib/services/auth/resend-otp.service";

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

    let body: unknown;

    // 1) Parse JSON
    try {
      body = await req.json();
    } catch {
      return badRequest(
        "Invalid JSON in request body",
        ErrorCode.VALIDATION_ERROR,
        { body: "Malformed JSON" },
        context
      );
    }

    // 2) Zod validation
    const parseResult = resendOtpSchema.safeParse(body);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() || "form";
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      });

      return validationError(fieldErrors, "Invalid input", context);
    }

    const data = parseResult.data as ResendOtpData;

    // 3) Call service
    try {
      const result = await resendOtpService(data);
      return accepted(result, "A new OTP has been sent to your email address.", meta);
    } catch (error: any) {
      // Known service-level errors
      if (error?.code === "TENANT_NOT_FOUND") {
        return notFound(
          "No account found with this email",
          ErrorCode.NOT_FOUND,
          error.details,
          context
        );
      }

      if (error?.code === "EMAIL_ALREADY_VERIFIED") {
        return badRequest(
          "Email already verified",
          ErrorCode.INVALID_OPERATION,
          undefined,
          context
        );
      }

      if (error?.code === "OTP_EMAIL_FAILED") {
        // OTP created, email failed → 202 Accepted (same idea as your original)
        return accepted(
          { otpExpires: error.otpExpires },
          "Could not send OTP email, but OTP was generated. Please try again or contact support.",
          meta
        );
      }

      // Unknown service error: bubble up as 500
      console.error("Resend OTP service error:", error);
      return internalError(
        "Failed to resend OTP",
        ErrorCode.INTERNAL_ERROR,
        {
          message: error instanceof Error ? error.message : "Unexpected error",
          ...(error instanceof Error && { stack: error.stack }),
        },
        context
      );
    }
  } catch (error: any) {
    console.error("Resend OTP route error:", error);
    return internalError(
      "Failed to resend OTP",
      ErrorCode.INTERNAL_ERROR,
      {
        message: error instanceof Error ? error.message : "Unexpected error",
        ...(error instanceof Error && { stack: error.stack }),
      },
      context
    );
  }
}
