import { sendEmail } from "@/lib/email/sendEmail";
import { apiResponse } from "@/lib/utils/apiResponse";

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    // ✅ Basic validation
    if (!to || !subject || !html) {
      return apiResponse(
        { message: "Missing required fields: to, subject, html" },
        400
      );
    }

    // ✅ Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return apiResponse({ message: "Invalid recipient email address" }, 400);
    }

    // ✅ Send email
    await sendEmail(to, subject, html);

    return apiResponse({ message: "Email sent successfully" }, 200);
  } catch (error: unknown) {
    console.error("❌ Email API error:", error);

    return apiResponse(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unexpected error while sending email",
      },
      500
    );
  }
}
