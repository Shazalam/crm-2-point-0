// emails/senders/send-verification.tsx
import React from "react";
import { render } from "@react-email/render";
import { sendEmail } from "@/lib/utils/send/sendEmail";
import { VerificationOtpEmail } from "@/emails/templates/VerificationEmail";

export interface SendVerificationEmailOptions {
  email: string;
  name: string;
  otp: string;
  expiresIn?: number; // minutes
}

export async function sendVerificationEmail({
  email,
  name,
  otp,
  expiresIn = 10,
}: SendVerificationEmailOptions) {
  const html = await render(
    <VerificationOtpEmail name={name} otp={otp} expiresIn={expiresIn} />
  );

  await sendEmail({
    to: email,
    subject: "Verify your FlowCRM Account",
    html,
  });
}
