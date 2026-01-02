import { sendVerificationEmail } from "@/emails/senders/send-verification";
import { VerificationToken } from "@/lib/models";
import Tenant from "@/lib/models/Tenant";
import { ITenantResponse } from "@/lib/types";
import { comparePassword, generateOtp, signToken } from "@/lib/utils/auth";
import logger from "@/lib/utils/logger";
import type { LoginTenantFormValues } from "@/lib/validators/auth.validator";

export async function loginTenantService(
    input: LoginTenantFormValues
): Promise<ITenantResponse> {
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    logger.debug("Login attempt starting", { email });

    // Find tenant with password selected
    const tenant = await Tenant.findOne({ email }).select("+password");

    if (!tenant) {
        logger.warn("Login failed: tenant not found", { email });
        const error: any = new Error("Invalid credentials");
        error.code = "INVALID_CREDENTIALS";
        throw error;
    }

    const isMatch = await comparePassword(password, tenant.password);
    if (!isMatch) {
        logger.warn("Login failed: password mismatch", { email, tenantId: tenant._id.toString() });
        const error: any = new Error("Invalid credentials");
        error.code = "INVALID_CREDENTIALS";
        throw error;
    }

    if (tenant && !tenant.emailVarified) {
        logger.info("Login blocked: email not verified, generating OTP", {
            email,
            tenantId: tenant._id.toString(),
        });
        // 8) Generate OTP & store verification token
        const otp = generateOtp();
        const expires = new Date(Date.now() + 2 * 60 * 1000); // 10 minutes

        // Delete old tokens for this email (normalized)
        await VerificationToken.deleteMany({ email });

        // Create new token
        await VerificationToken.create({
            email,
            otp,
            expires,
        });

        // 9) Fire verification email (do not break tenant creation on email failure)
        try {
            await sendVerificationEmail({
                email,
                name: tenant?.name,
                otp,
                expiresIn: 10,
            });
            logger.info("Verification email sent during login", {
                email,
                tenantId: tenant._id.toString(),
                otpExpiresAt: expires,
            });
        } catch (emailError) {
            logger.error("Failed to send verification email during login", {
                email,
                tenantId: tenant._id.toString(),
                error: emailError instanceof Error ? emailError.message : String(emailError),
            });
            // Do not throw here – user can request a new OTP later
        }


        return {
            id: tenant._id.toString(),
            name: tenant.name,
            email: tenant.email,
            phoneNumber: tenant.phoneNumber,
            otpExpiresIn: expires,
            requiresVerification: true,
            slug: tenant.slug,
            createdAt: tenant.createdAt,
        };
    }

    const token = signToken(tenant._id);

    logger.info("Login service: tenant authenticated", {
        tenantId: tenant._id.toString(),
        email: tenant.email,
    });

    const response = {
        id: tenant._id.toString(),
        name: tenant.name,
        email: tenant.email,
        phoneNumber: tenant.phoneNumber,
        requiresVerification: true,
        slug: tenant.slug,
        createdAt: tenant.createdAt,
        token,
    };

    return response
}
