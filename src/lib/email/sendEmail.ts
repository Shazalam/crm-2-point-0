import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER!;
const emailPass = process.env.EMAIL_PASS!;

if (!emailUser || !emailPass) {
  throw new Error('Email credentials are not defined in environment variables');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendOTPEmail({ to, subject, html }: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"BookFlyDriveStay" <${emailUser}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

// export async function sendEmail(to: string, subject: string, html: string) {
//   await transporter.sendMail({
//     from: `"Car Rentals" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html,
//   });
// }

export function generateOtpEmail(otp: string, name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; background: #f9f9f9; }
            .otp-code { font-size: 32px; font-weight: bold; text-align: center; color: #667eea; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>BookFlyDriveStay</h1>
                <p>Email Verification</p>
            </div>
            <div class="content">
                <h2>Hello ${name},</h2>
                <p>Thank you for registering with BookFlyDriveStay. Use the OTP below to verify your email address:</p>
                <div class="otp-code">${otp}</div>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 BookFlyDriveStay. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

