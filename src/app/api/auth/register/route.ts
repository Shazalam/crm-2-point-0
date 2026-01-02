// app/api/tenant/register/route.ts
import { NextRequest } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/utils/db";
import {
  badRequest,
  conflict,
  created,
  internalError,
  validationError,
  ErrorCode,
  type RequestContext,
} from "@/lib/utils/apiResponse";
import {
  registerTenantSchema,
  type RegisterTenantFormValues,
} from "@/lib/validators/auth.validator";
import { registerTenantService } from "@/lib/services/auth/register.service";
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
      logger.warn("Invalid JSON in register request body", {
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

    logger.info("Register tenant request received", {
      requestId: context.requestId,
      ip: context.ipAddress,
      userAgent: context.userAgent,
    });

    // Zod validation
    const parseResult = registerTenantSchema.safeParse(body);

    if (!parseResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() || "form";
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      });

      logger.warn("Register tenant validation failed", {
        requestId: context.requestId,
        issues: parseResult.error.issues,
      });

      return validationError(fieldErrors, "Invalid input", context);
    }

    const { name, email, password, phoneNumber } =
      parseResult.data as RegisterTenantFormValues;

    if (!name || !email || !password) {
      logger.warn("Register tenant missing required fields", {
        requestId: context.requestId,
        email,
      });

      return badRequest(
        "Missing required fields",
        ErrorCode.REQUIRED_FIELD,
        { fields: ["name", "email", "password"] },
        context
      );
    }

    try {
      const tenantDTO = await registerTenantService({
        name,
        email,
        password,
        phoneNumber,
      });

      logger.info("Tenant registered successfully", {
        requestId: context.requestId,
        tenantId: tenantDTO.id,
        email: tenantDTO.email,
      });

      return created(tenantDTO, "Tenant registered successfully", meta);
    } catch (error: any) {
      // Map known service errors
      if (error?.code === "WEAK_PASSWORD") {
        logger.warn("Tenant registration failed: weak password", {
          requestId: context.requestId,
          email,
          details: error.details,
        });

        return validationError(
          error.details ?? {
            password: [
              "Must contain: uppercase, lowercase, number, special character & be 8+ characters.",
            ],
          },
          "Weak password",
          context
        );
      }

      if (error?.code === "TENANT_EMAIL_EXISTS") {
        logger.warn("Tenant registration failed: email already exists", {
          requestId: context.requestId,
          email,
        });

        return conflict(
          "Tenant with this email already exists",
          ErrorCode.ALREADY_EXISTS,
          error.details,
          context
        );
      }

      if (error?.code === "MISSING_FIELDS") {
        logger.warn("Tenant registration failed: missing fields", {
          requestId: context.requestId,
          email,
          fields: error.fields,
        });

        return badRequest(
          error.message || "Missing required fields",
          ErrorCode.REQUIRED_FIELD,
          { fields: error.fields },
          context
        );
      }

      logger.error("Tenant registration service error", {
        requestId: context.requestId,
        email,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      return internalError(
        "Failed to register tenant",
        ErrorCode.INTERNAL_ERROR,
        {
          message: error instanceof Error ? error.message : "Unexpected error",
          ...(error instanceof Error && { stack: error.stack }),
        },
        context
      );
    }
  } catch (error: any) {
    logger.error("Tenant registration route fatal error", {
      requestId: context.requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return internalError(
      "Failed to register tenant",
      ErrorCode.INTERNAL_ERROR,
      {
        message: error instanceof Error ? error.message : "Unexpected error",
        ...(error instanceof Error && { stack: error.stack }),
      },
      context
    );
  }
}
