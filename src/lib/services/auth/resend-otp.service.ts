import Tenant from "@/lib/models/Tenant";
import VerificationToken from "@/lib/models/VerificationOtp";
import { generateOtp } from "@/lib/utils/auth";
import { sendVerificationEmail } from "@/emails/senders/send-verification";
import { ResendOtpData } from "@/lib/validators/auth.validator";
import { ITenant } from "@/lib/types";

export interface ResendOtpResult {
  otpExpires: Date;
}

export async function resendOtpService(input: ResendOtpData): Promise<ResendOtpResult> {
  const email = input.email.trim().toLowerCase();

  // 1) Check tenant
  const user = await Tenant.findOne({ email: email.toLowerCase() }).lean<ITenant | null>();

  if (!user) {
    const error: any = new Error("No account found with this email");
    error.code = "TENANT_NOT_FOUND";
    error.details = { email };
    throw error;
  }

  // 2) If already verified, block resend
  if (user?.emailVerified) {
    const error: any = new Error("Email already verified");
    error.code = "EMAIL_ALREADY_VERIFIED";
    throw error;
  }

  // 3) Delete old tokens
  await VerificationToken.deleteMany({ email });

  // 4) Generate new OTP
  const otp = generateOtp();
  const expires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes (or whatever you want)

  await VerificationToken.create({
    email,
    otp,
    expires,
  });

  // 5) Send verification email (reuse same template as register)
  try {
    await sendVerificationEmail({
      email,
      name:user?.name,
      otp,
      expiresIn: 2,
    });

  } catch (err) {
    // Log and rethrow a “soft” error if you want special handling in controller
    console.error("Failed to send resend OTP email:", err);
    const error: any = new Error("OTP generated but email sending failed");
    error.code = "OTP_EMAIL_FAILED";
    error.details = { email };
    throw error;
  }

  return { otpExpires: expires };
}
