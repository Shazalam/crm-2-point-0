import dbConnect from '@/app/(lib)/db';
import { generateOtpEmail, sendEmail } from '@/app/(lib)/email';         // replace with your actual mail function
import { generateOtp } from '@/app/(lib)/utils/utils';
import { ApiResponse, ErrorCode } from '@/app/(lib)/utils/api-response';
import User from '@/app/models/User';
import VerificationToken from '@/app/models/VerificationToken';
import { NextRequest } from 'next/server';
import { ResendOtpData, resendOtpSchema } from '@/app/(lib)/validators/userValidator';
import { ResendOtpResponseData } from '@/app/(types)/user';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    // Validate request with Zod
    const parsed = resendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.badRequest(
        'Validation failed',
        ErrorCode.VALIDATION_ERROR,
        { errors: parsed.error.flatten().fieldErrors }
      );
    }
    const { email } = parsed.data as ResendOtpData;



    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return ApiResponse.notFound(
        'No account found with this email',
        ErrorCode.NOT_FOUND,
        { email }
      );
    }

    // If already verified, prevent redundant OTP sends
    if (user.emailVerified) {
      return ApiResponse.badRequest(
        'Email already verified',
        ErrorCode.INVALID_OPERATION
      );
    }

    // Delete existing tokens for this email
    await VerificationToken.deleteMany({ email: email.toLowerCase() });

    // Generate new OTP
    const otp = generateOtp();
    const expires = new Date(Date.now() + 1 * 60 * 1000); // 10 minutes

    await VerificationToken.create({
      email: email.toLowerCase(),
      token: otp,
      expires,
    });

    // Send email
    try {
      await sendEmail({
        to: email,
        subject: 'Resend Verification Code - BookFlyDriveStay',
        html: generateOtpEmail(otp, `${user.firstName} ${user.lastName}`),
      });
    } catch (err) {
      console.error('Error sending OTP email:', err);
      // Returning 202 Accepted since the OTP was generated/stored anyway
      return ApiResponse.accepted(
        null,
        'Could not send OTP email, but OTP was generated. Please try again or contact support.'
      );
    }

    return ApiResponse.success<ResendOtpResponseData>(
      { otpExpires: expires },
      'A new OTP has been sent to your email address.'
    );
  } catch (error: unknown) {
    console.error('Resend OTP error:', error);
    return ApiResponse.internalError(
      'Failed to resend OTP',
      ErrorCode.INTERNAL_ERROR,
      process.env.NODE_ENV === 'development'
        ? { error: error instanceof Error ? error.message : String(error) }
        : undefined
    );
  }
}
