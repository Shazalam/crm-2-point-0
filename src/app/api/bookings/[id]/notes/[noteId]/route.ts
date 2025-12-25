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

/**
 * PUT /api/bookings/[id]/notes/[noteId]
 * Updates a specific note within a booking
 *
 * Request body:
 * {
 *   "text": "Updated note content"
 * }
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    await connectDB();

    // ✅ Await params (Next.js 15+)
    const { id, noteId } = await context.params;

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

    const { text } = body;

    // ✅ Validate required fields
    if (!text || typeof text !== "string") {
      return badRequest(
        "Note text is required and must be a string",
        ErrorCode.REQUIRED_FIELD,
        { field: "text" }
      );
    }

    if (text.trim().length === 0) {
      return badRequest(
        "Note text cannot be empty",
        ErrorCode.VALIDATION_ERROR,
        { field: "text" }
      );
    }

    // ✅ Validate MongoDB ObjectIds
    if (!isValidMongoId(id) || !isValidMongoId(noteId)) {
      return badRequest(
        "Invalid booking or note ID format",
        ErrorCode.VALIDATION_ERROR,
        { bookingId: id, noteId }
      );
    }

    // ✅ Update the note
    const booking = await Booking.findOneAndUpdate(
      { _id: id, "notes._id": noteId },
      {
        $set: {
          "notes.$.text": text.trim(),
          "notes.$.updatedAt": new Date(),
        },
      },
      { new: true }
    );

    // ✅ Check if booking or note exists
    if (!booking) {
      return notFound(
        "Booking or note not found",
        ErrorCode.NOT_FOUND,
        { bookingId: id, noteId }
      );
    }

    // ✅ Success response
    return success(
      {
        booking,
        updatedNote: {
          noteId,
          text: text.trim(),
          updatedAt: new Date().toISOString(),
        },
      },
      "Note updated successfully",
      HttpStatus.OK
    );
  } catch (error: unknown) {
    console.error("❌ Update Note Error:", error);

    if (error instanceof Error) {
      // Database connection errors
      if (error.message.includes("connect")) {
        return internalError(
          "Database connection failed. Please try again later.",
          ErrorCode.DATABASE_ERROR,
          { originalError: error.message }
        );
      }

      // Validation errors from Mongoose
      if (error.message.includes("validation")) {
        return unprocessableEntity(
          "Note validation failed",
          ErrorCode.VALIDATION_ERROR,
          { originalError: error.message }
        );
      }

      return internalError(
        "Failed to update note",
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
 * DELETE /api/bookings/[id]/notes/[noteId]
 * Deletes a specific note from a booking (requires authentication)
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    await connectDB();

    // ✅ Await params (Next.js 15+)
    const { id, noteId } = await context.params;

    // ✅ Validate MongoDB ObjectIds
    if (!isValidMongoId(id) || !isValidMongoId(noteId)) {
      return badRequest(
        "Invalid booking or note ID format",
        ErrorCode.VALIDATION_ERROR,
        { bookingId: id, noteId }
      );
    }

    // ✅ Authentication: Extract and verify token
    const token = extractTokenFromCookie(req.headers.get("cookie"));
    if (!token) {
      return unauthorized(
        "Authentication token is required",
        ErrorCode.UNAUTHENTICATED
      );
    }

    // ✅ Verify token validity
    const decoded = verifyToken(token);
    if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
      return unauthorized(
        "Invalid or expired authentication token",
        ErrorCode.INVALID_TOKEN,
        { details: "Token verification failed" }
      );
    }

    // ✅ Delete the note using $pull operator
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { $pull: { notes: { _id: noteId } } },
      { new: true }
    );

    // ✅ Check if booking exists
    if (!updatedBooking) {
      return notFound(
        "Booking not found",
        ErrorCode.NOT_FOUND,
        { bookingId: id }
      );
    }

    // ✅ Check if note was actually deleted
    const noteFound = updatedBooking.notes.some(
      (note: { _id: string }) => note._id.toString() === noteId
    );
    if (noteFound) {
      return notFound(
        "Note not found in booking",
        ErrorCode.NOT_FOUND,
        { noteId }
      );
    }

    // ✅ Success response
    return success(
      {
        booking: updatedBooking,
        deletedNoteId: noteId,
      },
      "Note deleted successfully",
      HttpStatus.OK
    );
  } catch (error: unknown) {
    console.error("❌ Delete Note Error:", error);

    if (error instanceof Error) {
      // Database connection errors
      if (error.message.includes("connect")) {
        return internalError(
          "Database connection failed. Please try again later.",
          ErrorCode.DATABASE_ERROR,
          { originalError: error.message }
        );
      }

      return internalError(
        "Failed to delete note",
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
 * Utility: Validate MongoDB ObjectId format
 * @param id - The ID to validate
 * @returns true if valid ObjectId format, false otherwise
 */
function isValidMongoId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Utility: Extract JWT token from cookie header
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