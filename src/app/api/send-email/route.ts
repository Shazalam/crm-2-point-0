import { badRequest, ErrorCode, HttpStatus, internalError, success, validationError } from "@/lib/utils/apiResponse";
import { sendEmail } from "@/lib/utils/send/sendEmail";


/**
 * POST /api/email
 * Sends an email with validation and proper error handling
 *
 * Request body:
 * {
 *   "to": "recipient@example.com",
 *   "subject": "Email Subject",
 *   "html": "<h1>Email Content</h1>"
 * }
 */
export async function POST(req: Request) {
  try {
    // ✅ Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return badRequest(
        "Invalid JSON in request body",
        ErrorCode.VALIDATION_ERROR
      );
    }

    const { to, subject, html } = body;

    // ✅ Validate required fields
    const validationErrors: Record<string, string[]> = {};

    if (!to || typeof to !== "string") {
      validationErrors.to = ["Email recipient is required"];
    }
    if (!subject || typeof subject !== "string") {
      validationErrors.subject = ["Email subject is required"];
    }
    if (!html || typeof html !== "string") {
      validationErrors.html = ["Email HTML content is required"];
    }

    if (Object.keys(validationErrors).length > 0) {
      return validationError(validationErrors);
    }

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return badRequest(
        "Invalid recipient email address",
        ErrorCode.INVALID_EMAIL,
        { email: to }
      );
    }

    // ✅ Validate subject length
    if (subject.trim().length === 0) {
      return badRequest(
        "Email subject cannot be empty",
        ErrorCode.VALIDATION_ERROR,
        { field: "subject" }
      );
    }

    // ✅ Validate HTML content length (optional: set reasonable limit)
    if (html.trim().length === 0) {
      return badRequest(
        "Email content cannot be empty",
        ErrorCode.VALIDATION_ERROR,
        { field: "html" }
      );
    }

    if (html.length > 1000000) {
      // 1MB limit
      return badRequest(
        "Email content exceeds maximum size (1MB)",
        ErrorCode.VALIDATION_ERROR,
        { maxSize: "1MB", currentSize: `${Math.round(html.length / 1024)}KB` }
      );
    }

    // ✅ Send email
    await sendEmail({
      to,
      subject,
      html,
    });

    // ✅ Success response
    return success(
      {
        to,
        subject,
        sentAt: new Date().toISOString(),
      },
      "Email sent successfully",
      HttpStatus.OK
    );
  } catch (error: unknown) {
    console.error("❌ Email API Error:", error);

    // ✅ Handle email service errors
    if (error instanceof Error) {
      // Check for specific email service errors
      if (error.message.includes("Failed to send email")) {
        return internalError(
          "Failed to send email. Please try again later.",
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          { originalError: error.message }
        );
      }

      // Network or connection errors
      if (
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("ETIMEDOUT")
      ) {
        return internalError(
          "Email service temporarily unavailable. Please try again later.",
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          { originalError: error.message }
        );
      }

      // Generic error message
      return internalError(
        "An error occurred while sending the email",
        ErrorCode.INTERNAL_ERROR,
        { originalError: error.message }
      );
    }

    // Fallback for non-Error objects
    return internalError(
      "An unexpected error occurred",
      ErrorCode.INTERNAL_ERROR,
      { originalError: String(error) }
    );
  }
}