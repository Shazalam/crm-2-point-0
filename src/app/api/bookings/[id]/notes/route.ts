import { NextRequest } from "next/server";
import { connectDB } from "@/lib/utils/db";
import Booking from "@/lib/models/Booking";
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
 * Maximum length for a note text to prevent abuse
 */
const MAX_NOTE_LENGTH = 5000; // 5KB

/**
 * Minimum length for a note text to ensure it's not empty
 */
const MIN_NOTE_LENGTH = 1;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Represents a note attached to a booking
 */
interface Note {
  _id?: string;
  text: string;
  agentName: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Request body for creating a new note
 */
interface CreateNoteRequest {
  text: string;
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
 * Validates MongoDB ObjectId format
 * @param id - The ID to validate
 * @returns true if valid ObjectId format, false otherwise
 */
function isValidMongoId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validates note text format and length
 * @param text - The note text to validate
 * @returns Object with isValid flag and error message if invalid
 */
function validateNoteText(text: unknown): { isValid: boolean; error?: string } {
  if (!text || typeof text !== "string") {
    return {
      isValid: false,
      error: "Note text is required and must be a string",
    };
  }

  const trimmedText = String(text).trim();

  if (trimmedText.length < MIN_NOTE_LENGTH) {
    return {
      isValid: false,
      error: `Note text cannot be empty`,
    };
  }

  if (trimmedText.length > MAX_NOTE_LENGTH) {
    return {
      isValid: false,
      error: `Note text exceeds maximum length of ${MAX_NOTE_LENGTH} characters (current: ${trimmedText.length})`,
    };
  }

  return { isValid: true };
}

/**
 * Creates a new note object
 * @param text - The note text
 * @param agentName - The agent's name
 * @param agentId - The agent's ID
 * @returns A new note object
 */
function createNoteObject(
  text: string,
  agentName: string,
  agentId: string
): Note {
  return {
    text: String(text).trim(),
    agentName: agentName || "Unknown Agent",
    createdBy: agentId,
    createdAt: new Date(),
  };
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * POST /api/bookings/[id]/notes
 * Creates a new note and attaches it to a booking
 *
 * ✅ When to use:
 *    - Adding internal notes to a booking
 *    - Recording communication or agent comments
 *    - Documenting booking changes or requests
 *    - Tracking agent interactions
 *
 * Request body: {
 *   text: string  // Note content (required, 1-5000 characters)
 * }
 *
 * Response: success() or unauthorized() or badRequest() or notFound() or internalError()
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // ============================================================
    // STEP 1: Extract and validate booking ID from params
    // ============================================================
    const { id: bookingId } = await context.params;

    if (!bookingId || !isValidMongoId(bookingId)) {
      return badRequest(
        "Invalid booking ID format",
        ErrorCode.VALIDATION_ERROR,
        { bookingId }
      );
    }

    // ============================================================
    // STEP 2: Authentication - Verify user token
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
    // STEP 3: Parse and validate request body
    // ============================================================
    let body: CreateNoteRequest;
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

    // ============================================================
    // STEP 4: Validate note text
    // ============================================================
    const textValidation = validateNoteText(body.text);
    if (!textValidation.isValid) {
      return badRequest(
        textValidation.error || "Invalid note text",
        ErrorCode.VALIDATION_ERROR,
        {
          field: "text",
          maxLength: MAX_NOTE_LENGTH,
          minLength: MIN_NOTE_LENGTH,
        }
      );
    }

    // ============================================================
    // STEP 5: Fetch booking
    // ============================================================
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return notFound(
        "Booking not found",
        ErrorCode.NOT_FOUND,
        { bookingId }
      );
    }

    // ============================================================
    // STEP 6: Create and add note
    // ============================================================
    const newNote = createNoteObject(
      body.text,
      decoded.name || "Unknown Agent",
      decoded.id
    );

    // Ensure notes array exists
    if (!Array.isArray(booking.notes)) {
      booking.notes = [];
    }

    booking.notes.push(newNote as any);

    // ============================================================
    // STEP 7: Save booking with new note
    // ============================================================
    const updatedBooking = await booking.save();

    // ============================================================
    // STEP 8: Return success response
    // ============================================================
    return success(
      {
        booking: updatedBooking,
        noteId: updatedBooking.notes[updatedBooking.notes.length - 1]._id,
        totalNotes: updatedBooking.notes.length,
      },
      "Note added successfully",
      HttpStatus.CREATED // ✅ Use 201 for resource creation
    );
  } catch (error: unknown) {
    console.error("❌ Create Note Error:", error);

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
        "Failed to create note",
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