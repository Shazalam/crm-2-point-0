import { connectDB } from "@/lib/utils/db";
import Booking from "@/lib/models/Booking";
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/utils/auth";
import {
  badRequest,
  notFound,
  unauthorized,
  internalError,
  success,
  unprocessableEntity,
  ErrorCode,
  HttpStatus,
} from "@/lib/utils/apiResponse";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Required fields for creating a cancellation record
 * Used when processing new cancellations without an existing booking
 */
const REQUIRED_FIELDS = [
  "fullName",
  "phoneNumber",
  "rentalCompany",
  "confirmationNumber",
  "pickupDate",
  "dropoffDate",
  "pickupLocation",
  "dropoffLocation",
  "cardLast4",
  "expiration",
  "billingAddress",
  "dateOfBirth",
  "salesAgent",
];

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Represents a change in the cancellation timeline
 */
interface TimelineChange {
  text: string;
}

/**
 * Request body for booking cancellation
 */
interface CancellationRequest {
  bookingId?: string;
  customerType?: "existing" | "new";
  refundAmount?: number;
  mco?: number;
  [key: string]: unknown;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extracts JWT token from cookie header
 * @param cookieHeader - The cookie header string
 * @returns The token value or null if not found
 */
function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "token" && value) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * Validates required fields in the request data
 * @param data - The request payload
 * @param requiredFields - Array of field names that are required
 * @returns Array of missing field names, empty if all present
 */
function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): string[] {
  return requiredFields.filter(
    (field) => !data[field] || String(data[field]).trim() === ""
  );
}

/**
 * Creates timeline changes for an existing booking cancellation
 * @param existingBooking - The current booking data
 * @param newMco - The new MCO amount
 * @param refundAmount - The refund amount
 * @returns Array of timeline changes
 */
function createCancellationChanges(
  existingBooking: Record<string, unknown>,
  newMco?: number,
  refundAmount?: number
): TimelineChange[] {
  const changes: TimelineChange[] = [];

  // Check if MCO has changed
  if (newMco !== undefined && existingBooking.mco !== newMco) {
    changes.push({
      text: `MCO changed from $${existingBooking.mco} to $${newMco}`,
    });
  }

  // Check if refund amount is being set
  if (
    refundAmount !== undefined &&
    (!existingBooking.refundAmount ||
      existingBooking.refundAmount !== refundAmount)
  ) {
    changes.push({
      text: `Refund amount set to $${refundAmount}`,
    });
  }

  return changes;
}

/**
 * Creates initial timeline for a new cancellation
 * @param mco - The cancellation fee/MCO
 * @param refundAmount - The refund amount
 * @returns Array with single initial timeline entry
 */
function createNewCancellationTimeline(
  salesAgent: string,
  mco?: number,
  refundAmount?: number
) {
  return [
    {
      date: new Date().toISOString(),
      message: "Cancellation requested",
      agentName: salesAgent || "Unknown Agent",
      changes: [
        { text: "Reservation cancelled" },
        ...(mco ? [{ text: `Cancellation fee applied: $${mco}` }] : []),
        ...(refundAmount ? [{ text: `Refund amount: $${refundAmount}` }] : []),
      ] as TimelineChange[],
    },
  ];
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * POST /api/bookings/cancel
 * Handles booking cancellations for both existing and new bookings
 *
 * ✅ When to use:
 *    - Cancelling an existing booking (with bookingId and customerType="existing")
 *    - Creating a new cancellation record (with customerType="new")
 *    - Processing refunds and cancellation fees
 *    - Tracking cancellation timeline and changes
 *
 * Request body (existing booking):
 * {
 *   bookingId: string,
 *   customerType: "existing",
 *   refundAmount?: number,
 *   mco?: number,
 *   salesAgent: string
 * }
 *
 * Request body (new cancellation):
 * {
 *   customerType: "new",
 *   fullName: string,
 *   phoneNumber: string,
 *   ... (all required fields),
 *   refundAmount?: number,
 *   mco?: number,
 *   salesAgent: string
 * }
 *
 * Response: success() or unauthorized() or badRequest() or notFound() or internalError()
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // ============================================================
    // STEP 1: Authentication - Verify user token
    // ============================================================
    const token = extractTokenFromCookie(req.headers.get("cookie"));
    if (!token) {
      return unauthorized(
        "Authentication token is required",
        ErrorCode.UNAUTHENTICATED
      );
    }

    const decoded = verifyToken(token);
    if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
      return unauthorized(
        "Invalid or expired authentication token",
        ErrorCode.INVALID_TOKEN,
        { details: "Token verification failed" }
      );
    }

    // ============================================================
    // STEP 2: Parse and validate request body
    // ============================================================
    let body: CancellationRequest;
    try {
      body = await req.json();
    } catch {
      return badRequest(
        "Invalid JSON in request body",
        ErrorCode.VALIDATION_ERROR
      );
    }

    if (!body || typeof body !== "object") {
      return badRequest(
        "Request body must be a valid JSON object",
        ErrorCode.VALIDATION_ERROR
      );
    }

    const { bookingId, customerType, refundAmount, mco, ...rest } = body;

    // ============================================================
    // STEP 3: Route based on customer type (existing vs new)
    // ============================================================
    let booking;

    if (customerType === "existing") {
      // ========================================================
      // EXISTING BOOKING CANCELLATION
      // ========================================================

      // Validate booking ID
      if (!bookingId || typeof bookingId !== "string") {
        return badRequest(
          "Booking ID is required for existing booking cancellation",
          ErrorCode.REQUIRED_FIELD,
          { field: "bookingId" }
        );
      }

      // ========================================================
      // STEP 3A: Fetch existing booking
      // ========================================================
      const existingBooking = await Booking.findById(bookingId);

      if (!existingBooking) {
        return notFound(
          "Booking not found",
          ErrorCode.NOT_FOUND,
          { bookingId }
        );
      }

      // ========================================================
      // STEP 3B: Create timeline changes for updates
      // ========================================================
      const changes = createCancellationChanges(
        existingBooking.toObject(),
        mco,
        refundAmount
      );

      // ========================================================
      // STEP 3C: Create timeline entry
      // ========================================================
      const timelineEntry = {
        date: new Date().toISOString(),
        message: `Cancellation processed by ${rest.salesAgent || "System"}`,
        agentName: rest.salesAgent || "System",
        agentId: decoded.id,
        changes: changes.length > 0 ? changes : [{ text: "Booking cancelled" }],
      };

      // ========================================================
      // STEP 3D: Update existing booking
      // ========================================================
      booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          status: "CANCELLED",
          refundAmount: refundAmount ?? existingBooking.refundAmount,
          mco: mco ?? existingBooking.mco,
          updatedAt: new Date(),
          $push: { timeline: timelineEntry },
        },
        { new: true }
      );
    } else if (customerType === "new") {
      // ========================================================
      // NEW CANCELLATION RECORD
      // ========================================================

      // ========================================================
      // STEP 3E: Validate required fields for new cancellation
      // ========================================================
      const missingFields = validateRequiredFields(rest as Record<string, unknown>, REQUIRED_FIELDS);

      if (missingFields.length > 0) {
        return badRequest(
          `Missing required fields: ${missingFields.join(", ")}`,
          ErrorCode.REQUIRED_FIELD,
          { missingFields }
        );
      }

      // ========================================================
      // STEP 3F: Create new cancellation booking
      // ========================================================
      const newBookingData = {
        ...rest,
        status: "CANCELLED",
        refundAmount: refundAmount ?? 0,
        mco: mco ?? 0,
        agentId: decoded.id,
        timeline: createNewCancellationTimeline(
          String(rest.salesAgent),
          mco,
          refundAmount
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      booking = await Booking.create(newBookingData);
    } else {
      return badRequest(
        "Invalid customerType. Must be 'existing' or 'new'",
        ErrorCode.VALIDATION_ERROR,
        { validOptions: ["existing", "new"], provided: customerType }
      );
    }

    // ============================================================
    // STEP 4: Verify booking was processed
    // ============================================================
    if (!booking) {
      return notFound(
        "Failed to process cancellation",
        ErrorCode.NOT_FOUND
      );
    }

    // ============================================================
    // STEP 5: Return success response
    // ============================================================
    return success(
      {
        booking,
        cancellationId: booking._id,
        status: booking.status,
        refundAmount: booking.refundAmount,
        mco: booking.mco,
      },
      `Booking cancelled successfully${
        customerType === "existing" ? " (updated)" : " (new record)"
      }`,
      HttpStatus.OK
    );
  } catch (error: unknown) {
    console.error("❌ Cancel Booking Error:", error);

    if (error instanceof Error) {
      // Database connection errors
      if (error.message.includes("connect")) {
        return internalError(
          "Database connection failed. Please try again later.",
          ErrorCode.DATABASE_ERROR,
          { originalError: error.message }
        );
      }

      // MongoDB validation errors
      if (error.message.includes("validation")) {
        return unprocessableEntity(
          "Booking validation failed",
          ErrorCode.VALIDATION_ERROR,
          { originalError: error.message }
        );
      }

      // Cast errors (invalid MongoDB ID)
      if (error.message.includes("Cast")) {
        return badRequest(
          "Invalid booking ID format",
          ErrorCode.VALIDATION_ERROR,
          { originalError: error.message }
        );
      }

      return internalError(
        "Failed to cancel booking",
        ErrorCode.INTERNAL_ERROR,
        { originalError: error.message }
      );
    }

    return internalError(
      "An unexpected error occurred",
      ErrorCode.INTERNAL_ERROR,
      { originalError: String(error) }
    );
  }
}