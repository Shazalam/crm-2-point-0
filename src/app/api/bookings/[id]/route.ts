
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
// TYPE DEFINITIONS & INTERFACES
// ============================================================================

/**
 * Represents a single change in the booking timeline
 */
interface TimelineChange {
  text: string;
}

/**
 * Represents a complete timeline entry with all changes
 */
interface TimelineEntry {
  date: string;
  message: string;
  agentName: string;
  changes: TimelineChange[];
}

/**
 * Field labels for human-readable change descriptions
 */
const FIELD_LABELS: Record<string, string> = {
  pickupLocation: "Pickup Location",
  dropoffLocation: "Dropoff Location",
  pickupDate: "Pickup Date",
  dropoffDate: "Dropoff Date",
  pickupTime: "Pickup Time",
  dropoffTime: "Dropoff Time",
  fullName: "Full Name",
  email: "Email",
  phoneNumber: "Phone Number",
  rentalCompany: "Rental Company",
  confirmationNumber: "Confirmation Number",
  vehicleImage: "Vehicle Image",
  total: "Total",
  mco: "MCO",
  payableAtPickup: "Payable at Pickup",
  cardLast4: "Card Last 4 Digits",
  expiration: "Expiration",
  billingAddress: "Billing Address",
  status: "Status",
  dateOfBirth: "Date of Birth",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Formats time string from 24-hour format (HH:MM) to 12-hour format (H:MM)
 * @param time - Time string in format "HH:MM" or null/undefined
 * @returns Formatted time string or empty string
 */
function formatTime(time: string | null | undefined): string {
  if (!time) return "";

  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? "00";

  hour = hour % 12 || 12; // Convert 0 to 12
  return `${hour}:${minute}`;
}

/**
 * Validates MongoDB ObjectId format
 * @param id - The ID to validate
 * @returns true if valid ObjectId format, false otherwise
 */
function isValidMongoId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

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
 * Extracts booking ID from URL pathname
 * @param pathname - The URL pathname
 * @returns The booking ID or null if not found
 */
function extractBookingIdFromPath(pathname: string): string | null {
  const pathParts = pathname.split("/");
  const id = pathParts[pathParts.length - 1];
  return id && id.trim() ? id : null;
}

/**
 * Checks if a value should be treated as empty
 * @param value - The value to check
 * @returns true if the value is null, undefined, empty string, or "null"
 */
function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "null"
  );
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * GET /api/bookings/[id]
 * Retrieves a specific booking by ID
 *
 * ✅ When to use: Fetching booking details
 * Response: success() or notFound()
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    // ✅ Validate MongoDB ObjectId format
    if (!isValidMongoId(id)) {
      return badRequest(
        "Invalid booking ID format",
        ErrorCode.VALIDATION_ERROR,
        { bookingId: id }
      );
    }

    const booking = await Booking.findById(id);

    // ✅ Check if booking exists
    if (!booking) {
      return notFound(
        "Booking not found",
        ErrorCode.NOT_FOUND,
        { bookingId: id }
      );
    }

    // ✅ Success response with data
    return success(
      { booking },
      "Booking retrieved successfully",
      HttpStatus.OK
    );
  } catch (error: unknown) {
    console.error("❌ Get Booking Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("connect")) {
        return internalError(
          "Database connection failed. Please try again later.",
          ErrorCode.DATABASE_ERROR,
          { originalError: error.message }
        );
      }

      return internalError(
        "Failed to retrieve booking",
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

/**
 * PUT /api/bookings/[id]
 * Updates a booking with change tracking in timeline
 *
 * ✅ When to use:
 *    - Updating booking details (dates, times, personal info)
 *    - Tracking all changes in the timeline
 *    - Managing modification fees
 *
 * Request body: { field1: value1, field2: value2, ... }
 *
 * Response: success() or unauthorized() or notFound() or badRequest()
 */
export async function PUT(req: Request) {
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
    // STEP 2: Extract and validate booking ID from URL
    // ============================================================
    const bookingId = extractBookingIdFromPath(new URL(req.url).pathname);

    if (!bookingId || !isValidMongoId(bookingId)) {
      return badRequest(
        "Invalid or missing booking ID",
        ErrorCode.REQUIRED_FIELD,
        { field: "bookingId" }
      );
    }

    // ============================================================
    // STEP 3: Parse and validate request body
    // ============================================================
    let data;
    try {
      data = await req.json();
    } catch {
      return badRequest(
        "Invalid JSON in request body",
        ErrorCode.VALIDATION_ERROR
      );
    }

    if (!data || Object.keys(data).length === 0) {
      return badRequest(
        "Request body cannot be empty",
        ErrorCode.VALIDATION_ERROR
      );
    }

    // ============================================================
    // STEP 4: Fetch existing booking
    // ============================================================
    const existingBooking = await Booking.findById(bookingId);

    if (!existingBooking) {
      return notFound(
        "Booking not found",
        ErrorCode.NOT_FOUND,
        { bookingId }
      );
    }

    // ============================================================
    // STEP 5: Track changes and build update payload
    // ============================================================
    const changes: TimelineChange[] = [];
    const updatedFields: Record<string, unknown> = {};

    // Handle modification fees
    if (data.modificationFee && Array.isArray(data.modificationFee)) {
      updatedFields.modificationFee = data.modificationFee;
      const lastFee = data.modificationFee[data.modificationFee.length - 1];
      if (
        JSON.stringify(existingBooking.modificationFee) !==
        JSON.stringify(data.modificationFee)
      ) {
        changes.push({ text: `Modification fee added: $${lastFee.charge}` });
      }
    }

    // Track changes for each field
    Object.entries(FIELD_LABELS).forEach(([field, label]) => {
      const newValue = data[field];
      const oldValue = existingBooking[field];

      const oldEmpty = isEmpty(oldValue);
      const displayOld = oldEmpty ? null : oldValue;
      const displayNew = newValue ?? "";

      // Handle numeric fields (total, mco, payableAtPickup)
      if (["total", "mco", "payableAtPickup"].includes(field)) {
        const numNew = newValue ? Number(newValue) : 0;
        const numOld = oldValue ? Number(oldValue) : 0;

        if (numNew !== numOld) {
          changes.push({
            text: `Change in ${label}: from "${numOld}" to "${numNew}"`,
          });
          updatedFields[field] = numNew;
        }
        return;
      }

      // Handle date fields (pickupDate, dropoffDate)
      if (["pickupDate", "dropoffDate"].includes(field)) {
        const oldDate = oldValue ? oldValue : null;
        const newDate = newValue ? newValue : null;

        if (oldDate !== newDate) {
          if (!oldDate) {
            changes.push({ text: `Change in ${label}: to "${newDate}"` });
          } else {
            changes.push({
              text: `Change in ${label}: from "${oldDate}" to "${newDate}"`,
            });
          }
          updatedFields[field] = newDate;
        }
        return;
      }

      // Handle time fields (pickupTime, dropoffTime)
      if (["pickupTime", "dropoffTime"].includes(field)) {
        const oldTimeFormatted = oldEmpty ? null : formatTime(oldValue);
        const newTimeFormatted = newValue ? formatTime(newValue) : "";

        if (oldTimeFormatted !== newTimeFormatted) {
          if (!oldTimeFormatted) {
            changes.push({
              text: `Change in ${label}: to "${newTimeFormatted}"`,
            });
          } else {
            changes.push({
              text: `Change in ${label}: from "${oldTimeFormatted}" to "${newTimeFormatted}"`,
            });
          }
          updatedFields[field] = newValue;
        }
        return;
      }

      // Handle all other fields
      if (newValue !== undefined && newValue !== oldValue) {
        if (oldEmpty) {
          changes.push({ text: `Change in ${label}: to "${displayNew}"` });
        } else {
          changes.push({
            text: `Change in ${label}: from "${displayOld}" to "${displayNew}"`,
          });
        }
        updatedFields[field] = newValue;
      }
    });

    // ============================================================
    // STEP 6: Build update payload with timeline entry
    // ============================================================
    const updatePayload: Record<string, unknown> = { ...updatedFields };

    if (changes.length > 0) {
      const timelineEntry: TimelineEntry = {
        date: new Date().toISOString(),
        message: `Updated ${changes.length} field(s)`,
        agentName: decoded?.name || "Unknown Agent",
        changes,
      };
      updatePayload.$push = { timeline: timelineEntry };
    }

    // ============================================================
    // STEP 7: Execute update and return result
    // ============================================================
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updatePayload,
      { new: true }
    );

    return success(
      {
        booking: updatedBooking,
        changesTracked: changes.length,
      },
      `Booking updated successfully with ${changes.length} change(s)`,
      HttpStatus.OK
    );
  } catch (error: unknown) {
    console.error("❌ Update Booking Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("connect")) {
        return internalError(
          "Database connection failed. Please try again later.",
          ErrorCode.DATABASE_ERROR,
          { originalError: error.message }
        );
      }

      if (error.message.includes("validation")) {
        return unprocessableEntity(
          "Booking validation failed",
          ErrorCode.VALIDATION_ERROR,
          { originalError: error.message }
        );
      }

      return internalError(
        "Failed to update booking",
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

/**
 * DELETE /api/bookings/[id]
 * Soft-deletes a booking (marks as deleted without removing data)
 *
 * ✅ When to use:
 *    - User cancels booking (preserves history)
 *    - Logical deletion instead of permanent removal
 *    - Maintaining audit trail
 *
 * Response: success() or unauthorized() or notFound() or badRequest()
 */
export async function DELETE(req: Request) {
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
    // STEP 2: Extract and validate booking ID
    // ============================================================
    const bookingId = extractBookingIdFromPath(new URL(req.url).pathname);

    if (!bookingId || !isValidMongoId(bookingId)) {
      return badRequest(
        "Invalid or missing booking ID",
        ErrorCode.REQUIRED_FIELD,
        { field: "bookingId" }
      );
    }

    // ============================================================
    // STEP 3: Perform soft delete
    // ============================================================
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { isDeleted: true, deletedAt: new Date(), deletedBy: decoded.id },
      { new: true }
    );

    if (!booking) {
      return notFound(
        "Booking not found",
        ErrorCode.NOT_FOUND,
        { bookingId }
      );
    }

    // ============================================================
    // STEP 4: Return success response
    // ============================================================
    return success(
      {
        bookingId: booking._id,
        status: booking.status,
        deletedAt: new Date().toISOString(),
        deletedBy: decoded.name || "Unknown Agent",
      },
      "Booking soft-deleted successfully",
      HttpStatus.OK
    );
  } catch (error: unknown) {
    console.error("❌ Delete Booking Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("connect")) {
        return internalError(
          "Database connection failed. Please try again later.",
          ErrorCode.DATABASE_ERROR,
          { originalError: error.message }
        );
      }

      return internalError(
        "Failed to delete booking",
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