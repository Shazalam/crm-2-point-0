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
import { registerTenantService } from "@/lib/services/auth/register.service";
import { registerTenantSchema, type RegisterTenantFormValues} from './../../../../lib/validators/register.validator';

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

    let body;

    try {
      body = (await req.json());
    } catch {
      return badRequest(
        "Invalid JSON in request body",
        ErrorCode.VALIDATION_ERROR,
        { body: "Malformed JSON" },
        context
      );
    }

    // Zod validation (server-side)
    const parseResult = registerTenantSchema.safeParse(body);
    
    if (!parseResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() || "form";
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      });

      return validationError(fieldErrors, "Invalid input", context);
    }

    const { name, email, password, phoneNumber } =
      parseResult.data as RegisterTenantFormValues;

    // Route‑level validation can be done here or via Zod:
    // const { name, email, password, phoneNumber } = body;

    if (!name || !email || !password) {
      return badRequest(
        "Missing required fields",
        ErrorCode.REQUIRED_FIELD,
        { fields: ["name", "email", "password"] },
        context
      );
    }

    // Delegate to service
    const tenantDTO = await registerTenantService({
      name,
      email,
      password,
      phoneNumber
    });

    return created(tenantDTO, "Tenant registered successfully", meta);
  } catch (error: any) {
    // Map known service errors to proper responses
    if (error?.code === "WEAK_PASSWORD") {
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
      return conflict(
        "Tenant with this email already exists",
        ErrorCode.ALREADY_EXISTS,
        error.details,
        context
      );
    }

    if (error?.code === "MISSING_FIELDS") {
      return badRequest(
        error.message || "Missing required fields",
        ErrorCode.REQUIRED_FIELD,
        { fields: error.fields },
        context
      );
    }

    // Unknown/unexpected error → internal error
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
