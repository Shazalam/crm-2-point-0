import { NextRequest } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/utils/db";
import {
  badRequest,
  internalError,
  unauthorized,
  validationError,
  success,
  ErrorCode,
  type RequestContext,
  HttpStatus,
} from "@/lib/utils/apiResponse";
import {
  loginTenantSchema,
  type LoginTenantFormValues,
} from "@/lib/validators/auth.validator";
import { loginTenantService } from "@/lib/services/auth/login.service";
import logger from "@/lib/utils/logger";

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

    // Parse JSON
    try {
      body = await req.json();
    } catch {
      logger.warn("Invalid JSON in login request body", {
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


    logger.info("Login request received", {
      requestId: context.requestId,
      ip: context.ipAddress,
      userAgent: context.userAgent,
    });

    // Zod validation
    const parseResult = loginTenantSchema.safeParse(body);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() || "form";
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      });
      logger.warn("Login validation failed", {
        requestId: context.requestId,
        issues: parseResult.error.issues,
      });
      return validationError(fieldErrors, "Invalid input", context);
    }

    const { email, password } =
      parseResult.data as LoginTenantFormValues;

    // Optional extra check (already covered by Zod)
    if (!email || !password) {
      logger.warn("Login request missing required fields", {
        requestId: context.requestId,
        email,
      });

      return badRequest(
        "Missing required fields",
        ErrorCode.REQUIRED_FIELD,
        { fields: ["email", "password"] },
        context
      );
    }

    // Delegate to service
    try {
      const result = await loginTenantService({
        email,
        password,
      });

      // CASE 1: requires verification → no cookie, send OTP info
      if (result.requiresVerification) {
        const payload = {
          id: result.id,
          name: result.name,
          email: result.email,
          phoneNumber: result.phoneNumber,
          slug: result.slug,
          createdAt: result.createdAt,
          requiresVerification: true,
          otpExpiresIn: result.otpExpiresIn,
        };

        logger.info("Login blocked: email not verified, OTP sent", {
          requestId: context.requestId,
          tenantId: result.id,
          email: result.email,
        });
        return success(
          payload,
          "Email not verified. OTP sent to your email.",
          HttpStatus.OK,
          meta
        );
      }

      // CASE 2: verified → set cookie and log in
      const payload = {
        id: result.id,
        name: result.name,
        email: result.email,
        phoneNumber: result.phoneNumber,
        slug: result.slug,
        createdAt: result.createdAt,
        requiresVerification: false,
      };

      logger.info("Login successful", {
        requestId: context.requestId,
        tenantId: result.id,
        email: result.email,
      });
      const res = success(
        payload,
        "Login successful",
        HttpStatus.OK,
        meta
      );

      if (result.token) {
        res.cookies.set("token", result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24,
          path: "/",
        });
      }

      return res;

    } catch (error: any) {
      if (error?.code === "INVALID_CREDENTIALS") {
        logger.warn("Login failed: invalid credentials", {
          requestId: context.requestId,
          email,
        });
        return unauthorized(
          "Invalid credentials",
          ErrorCode.UNAUTHORIZED,
          undefined,
          context
        );
      }

      logger.error("Login service error", {
        requestId: context.requestId,
        email,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return internalError(
        "Failed to login",
        ErrorCode.INTERNAL_ERROR,
        {
          message: error instanceof Error ? error.message : "Unexpected error",
          ...(error instanceof Error && { stack: error.stack }),
        },
        context
      );
    }
  } catch (error: any) {
    logger.error("Login route fatal error", {
      requestId: context.requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return internalError(
      "Failed to login",
      ErrorCode.INTERNAL_ERROR,
      {
        message: error instanceof Error ? error.message : "Unexpected error",
        ...(error instanceof Error && { stack: error.stack }),
      },
      context
    );
  }
}
