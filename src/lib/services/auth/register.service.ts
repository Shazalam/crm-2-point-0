// // lib/services/tenant.service.ts
// import crypto from "crypto";
// import Tenant from "@/lib/models/Tenant";
// import VerificationToken from "@/lib/models/VerificationOtp";
// import { generateOtp, hashPassword } from "@/lib/utils/auth";
// import { generateSlug } from "@/lib/helpers/slugify";
// import { sendVerificationEmail } from "@/emails/senders/send-verification";

// import { RegisterTenantFormValues } from "@/lib/validators/auth.validator";
// import { ITenantResponse } from "@/lib/types/tenant";

// const STRONG_PASSWORD_REGEX =
//   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

// // Reasonable email regex for most real-world cases
// const EMAIL_REGEX =
//   /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// export async function registerTenantService(
//   input: RegisterTenantFormValues
// ): Promise<ITenantResponse> {
//   // Normalize and defensively extract values
//   const rawName = input.name ?? "";
//   const rawEmail = input.email ?? "";
//   const rawPassword = input.password ?? "";
//   const rawPhoneNumber = input.phoneNumber ?? "";

//   const name = rawName.trim();
//   const email = rawEmail.trim().toLowerCase();
//   const password = rawPassword;
//   const phoneNumber = rawPhoneNumber.trim() || undefined;

//   // 1) Basic validation
//   const missingFields: string[] = [];
//   if (!name) missingFields.push("name");
//   if (!email) missingFields.push("email");
//   if (!password) missingFields.push("password");

//   if (missingFields.length > 0) {
//     const error: any = new Error("Missing required fields");
//     error.code = "MISSING_FIELDS";
//     error.fields = missingFields;
//     throw error;
//   }

//   // 2) Email format validation (no spaces, valid shape)
//   if (!EMAIL_REGEX.test(email)) {
//     const error: any = new Error("Invalid email format");
//     error.code = "INVALID_EMAIL";
//     error.details = {
//       email: ["Please provide a valid email address."],
//     };
//     throw error;
//   }

//   // 3) Password strength validation
//   if (!STRONG_PASSWORD_REGEX.test(password)) {
//     const error: any = new Error("Weak password");
//     error.code = "WEAK_PASSWORD";
//     error.details = {
//       password: [
//         "Must contain: uppercase, lowercase, number, special character & be 8+ characters.",
//       ],
//     };
//     throw error;
//   }

//   // 4) Check uniqueness by normalized email
//   const existingTenant = await Tenant.findOne({ email }).lean();
//   if (existingTenant) {
//     const error: any = new Error("Tenant with this email already exists");
//     error.code = "TENANT_EMAIL_EXISTS";
//     error.details = { email };
//     throw error;
//   }

//   // 5) Generate unique slug
//   let slug = generateSlug(name);
//   const slugExists = await Tenant.exists({ slug });

//   if (slugExists) {
//     slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
//   }

//   // 6) Hash password
//   const hashedPassword = await hashPassword(password);

//   // 7) Create tenant document
//   const tenantDoc = await Tenant.create({
//     name,
//     email,              // normalized lowercase
//     password: hashedPassword,
//     phoneNumber,
//     slug,
//     plan: "free",
//   });

//   // 8) Generate OTP & store verification token
//   const otp = generateOtp();
//   const expires = new Date(Date.now() + 2 * 60 * 1000); // 10 minutes

//   // Delete old tokens for this email (normalized)
//   await VerificationToken.deleteMany({ email });

//   // Create new token
//   await VerificationToken.create({
//     email,
//     otp,
//     expires,
//   });

//   // 9) Fire verification email (do not break tenant creation on email failure)
//   try {
//     await sendVerificationEmail({
//       email,
//       name,
//       otp,
//       expiresIn: 10,
//     });
//   } catch (emailError) {
//     console.error("Failed to send verification email:", emailError);
//     // Do not throw here – user can request a new OTP later
//   }

//   // 10) Return safe DTO
//   return {
//     id: tenantDoc._id.toString(),
//     name: tenantDoc.name,
//     email: tenantDoc.email,
//     phoneNumber: tenantDoc.phoneNumber,
//     otpExpiresIn:expires,
//     requiresVerification: true,
//     slug: tenantDoc.slug,
//     createdAt: tenantDoc.createdAt,
//   };
// }




// lib/services/tenant.service.ts
import crypto from "crypto";
import Tenant from "@/lib/models/Tenant";
import VerificationToken from "@/lib/models/VerificationOtp";
import { generateOtp, hashPassword } from "@/lib/utils/auth";
import { generateSlug } from "@/lib/helpers/slugify";
import { sendVerificationEmail } from "@/emails/senders/send-verification";
import { RegisterTenantFormValues } from "@/lib/validators/auth.validator";
import { ITenantResponse } from "@/lib/types/tenant";
import logger from "@/lib/utils/logger";

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function registerTenantService(
  input: RegisterTenantFormValues
): Promise<ITenantResponse> {
  const rawName = input.name ?? "";
  const rawEmail = input.email ?? "";
  const rawPassword = input.password ?? "";
  const rawPhoneNumber = input.phoneNumber ?? "";

  const name = rawName.trim();
  const email = rawEmail.trim().toLowerCase();
  const password = rawPassword;
  const phoneNumber = rawPhoneNumber.trim() || undefined;

  logger.debug("Register tenant service called", { email, name });

  // 1) Basic validation
  const missingFields: string[] = [];
  if (!name) missingFields.push("name");
  if (!email) missingFields.push("email");
  if (!password) missingFields.push("password");

  if (missingFields.length > 0) {
    logger.warn("Register tenant missing fields in service", {
      email,
      missingFields,
    });

    const error: any = new Error("Missing required fields");
    error.code = "MISSING_FIELDS";
    error.fields = missingFields;
    throw error;
  }

  // 2) Email format validation
  if (!EMAIL_REGEX.test(email)) {
    logger.warn("Register tenant invalid email format", { email });

    const error: any = new Error("Invalid email format");
    error.code = "INVALID_EMAIL";
    error.details = {
      email: ["Please provide a valid email address."],
    };
    throw error;
  }

  // 3) Password strength validation
  if (!STRONG_PASSWORD_REGEX.test(password)) {
    logger.warn("Register tenant weak password", { email });

    const error: any = new Error("Weak password");
    error.code = "WEAK_PASSWORD";
    error.details = {
      password: [
        "Must contain: uppercase, lowercase, number, special character & be 8+ characters.",
      ],
    };
    throw error;
  }

  // 4) Check uniqueness by normalized email
  const existingTenant = await Tenant.findOne({ email }).lean();
  if (existingTenant) {
    logger.warn("Register tenant email already exists", { email });

    const error: any = new Error("Tenant with this email already exists");
    error.code = "TENANT_EMAIL_EXISTS";
    error.details = { email };
    throw error;
  }

  // 5) Generate unique slug
  let slug = generateSlug(name);
  const slugExists = await Tenant.exists({ slug });

  if (slugExists) {
    const suffix = crypto.randomBytes(3).toString("hex");
    logger.info("Register tenant slug collision, appending suffix", {
      baseSlug: slug,
      suffix,
    });
    slug = `${slug}-${suffix}`;
  }
  // 6) Hash password
  const hashedPassword = await hashPassword(password);

  // 7) Create tenant document
  const tenantDoc = await Tenant.create({
    name,
    email,
    password: hashedPassword,
    phoneNumber,
    slug,
    plan: "free",
  });

  logger.info("Tenant document created", {
    tenantId: tenantDoc._id.toString(),
    email,
    slug: tenantDoc.slug,
  });

  // 8) Generate OTP & store verification token
  const otp = generateOtp();
  const expires = new Date(Date.now() + 2 * 60 * 1000);

  await VerificationToken.deleteMany({ email });

  await VerificationToken.create({
    email,
    otp,
    expires,
  });

  logger.info("Verification OTP generated and stored", {
    email,
    tenantId: tenantDoc._id.toString(),
    otpExpiresAt: expires,
  });

  // 9) Fire verification email
  try {
    await sendVerificationEmail({
      email,
      name,
      otp,
      expiresIn: 10,
    });

    logger.info("Verification email sent after registration", {
      email,
      tenantId: tenantDoc._id.toString(),
    });
  } catch (emailError) {
    logger.error("Failed to send verification email after registration", {
      email,
      tenantId: tenantDoc._id.toString(),
      error:
        emailError instanceof Error
          ? emailError.message
          : String(emailError),
    });
    // do not throw; user can request a new OTP later
  }

  // 10) Return safe DTO
  const dto: ITenantResponse = {
    id: tenantDoc._id.toString(),
    name: tenantDoc.name,
    email: tenantDoc.email,
    phoneNumber: tenantDoc.phoneNumber,
    otpExpiresIn: expires,
    requiresVerification: true,
    slug: tenantDoc.slug,
    createdAt: tenantDoc.createdAt,
  };

  logger.debug("Register tenant service returning DTO", {
    tenantId: dto.id,
    email: dto.email,
  });

  return dto;
}
