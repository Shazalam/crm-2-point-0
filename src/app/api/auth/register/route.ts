import { connectDB } from "@/lib/utils/db";
import { hashPassword } from "@/lib/utils/auth";
import Agent from "@/lib/models/Agent";
import { apiResponse } from "@/lib/utils/apiResponse";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return apiResponse({ error: "All fields are required" }, 400);
    }

    // ✅ Password strength validation
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongRegex.test(password)) {
      return apiResponse(
        {
          error:
            "Weak password: must be 8+ chars, include uppercase, lowercase, number, and special character",
        },
        400
      );
    }

    // check if exists
    const existing = await Agent.findOne({ email });
    if (existing) {
      return apiResponse({ error: "Agent already exists" }, 400);
    }

    // hash password
    const hashed = await hashPassword(password);

    const agent = await Agent.create({
      name,
      email,
      password: hashed,
    });

    // ✅ Don’t return password in response
    return apiResponse(
      {
        success: true,
        agent: { id: agent._id, name: agent.name, email: agent.email },
      },
      201
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return apiResponse({ error: message }, 500);
  }
}














// // app/api/tenant/register/route.ts
// import { NextRequest } from "next/server";
// import crypto from "crypto";
// import { connectDB } from "@/lib/utils/db";
// import Tenant from "@/lib/models/Tenant";
// import { hashPassword } from "@/lib/utils/auth";
// import { badRequest, conflict, created, ErrorCode, internalError, validationError } from "@/lib/utils/apiResponse";
// import type { RequestContext } from "@/lib/utils/apiResponse";

// // Helper to generate slug
// function generateSlug(name: string): string {
//   return name.toLowerCase().trim().replace(/\s+/g, "-");
// }

// export async function POST(req: NextRequest) {
//   // Setup request context (for logging + tracing)
//   const context: RequestContext = {
//     requestId: crypto.randomUUID(),
//     userAgent: req.headers.get("user-agent") || undefined,
//     ipAddress: req.headers.get("x-forwarded-for") || undefined,
//   };

//   const meta = {
//     timestamp: new Date().toISOString(),
//     version: process.env.APP_VERSION || "1.0.0",
//     requestId: context.requestId || undefined,
//   };



//   try {
//     await connectDB();
//     const body = await req.json();

//     const { name, email, password, phoneNumber } = body;

//     // Validate required fields
//     if (!name || !email || !password) {
//       return badRequest(
//         "Missing required fields",
//         ErrorCode.REQUIRED_FIELD,
//         { fields: ["name", "email", "password"] },
//         context
//       );
//     }

//     // Strong password validation
//     const strongPasswordRegex =
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

//     if (!strongPasswordRegex.test(password)) {
//       return validationError(
//         {
//           password: [
//             "Must contain: uppercase, lowercase, number, special character & be 8+ characters.",
//           ],
//         },
//         "Weak password",
//         context
//       );
//     }

//     // Check if tenant exists
//     const existingTenant = await Tenant.findOne({ email });
//     if (existingTenant) {
//       return conflict(
//         "Tenant with this email already exists",
//         ErrorCode.ALREADY_EXISTS,
//         { email },
//         context
//       );
//     }

//     // Create unique slug
//     let slug = generateSlug(name);
//     const slugExists = await Tenant.exists({ slug });

//     if (slugExists) {
//       slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
//     }

//     // Hash password
//     const hashedPassword = await hashPassword(password);

//     // Create tenant
//     const tenant = await Tenant.create({
//       name,
//       email,
//       password: hashedPassword,
//       phoneNumber,
//       slug,
//       plan: "free",
//     });

//     // Return safe response (no password leaking)
//     const responsePayload = {
//       id: tenant._id.toString(),
//       name,
//       email,
//       phoneNumber,
//       slug,
//       plan: tenant.plan,
//       createdAt: tenant.createdAt,
//       trialEndsAt: tenant.trialEndsAt,
//     };

//     return created(responsePayload, "Tenant registered successfully", 
//       meta,
//   );

//   } catch (error) {
//     return internalError(
//       "Failed to register tenant",
//       ErrorCode.INTERNAL_ERROR,
//       {
//         message: error instanceof Error ? error.message : "Unexpected error",
//         ...(error instanceof Error && { stack: error.stack }),
//       },
//       context
//     );
//   }
// }
