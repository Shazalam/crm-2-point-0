import { transporter } from "../providers/transporter";

export async function sendEmail({
  to,
  subject,
  html,
  fromName = "BFDS HUB CRM",
}: {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
}) {
  try {
    await transporter.sendMail({
      from: `"${fromName}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("❌ Email Send Error:", error);
    throw new Error("Failed to send email.");
  }
}
