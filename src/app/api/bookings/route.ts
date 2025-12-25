
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
 * Required fields for creating a new booking
 * All these fields must be present and non-empty
 */
const REQUIRED_FIELDS = [
  "fullName",
  "email",
  "phoneNumber",
  "rentalCompany",
  "cardLast4",
  "expiration",
  "billingAddress",
];

/**
 * Default values for optional fields
 */
const FIELD_DEFAULTS = {
  confirmationNumber: "",
  vehicleImage: "",
  total: 0,
  mco: 0,
  modificationFee: [],
  payableAtPickup: 0,
  pickupDate: "",
  dropoffDate: "",
  pickupTime: "",
  dropoffTime: "",
  pickupLocation: "",
  dropoffLocation: "",
  dateOfBirth: "",
  status: "BOOKED",
};

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
 * @returns Array of missing field names, empty if all present
 */
function validateRequiredFields(data: Record<string, unknown>): string[] {
  return REQUIRED_FIELDS.filter(
    (field) => !data[field] || String(data[field]).trim() === ""
  );
}

/**
 * Creates a normalized booking payload from request data
 * @param data - Raw request data
 * @param agentInfo - Authenticated agent information
 * @returns Normalized booking payload
 */
function createBookingPayload(
  data: Record<string, unknown>,
  agentInfo: { name: string; id: string }
) {
  return {
    // ✅ Personal information
    fullName: String(data.fullName).trim(),
    email: String(data.email).trim().toLowerCase(),
    phoneNumber: String(data.phoneNumber).trim(),
    dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth).trim() : "",

    // ✅ Rental information
    rentalCompany: String(data.rentalCompany).trim(),
    confirmationNumber: data.confirmationNumber
      ? String(data.confirmationNumber).trim()
      : "",
    vehicleImage: data.vehicleImage ? String(data.vehicleImage).trim() : "",

    // ✅ Pickup and dropoff details
    pickupDate: data.pickupDate ? String(data.pickupDate).trim() : "",
    dropoffDate: data.dropoffDate ? String(data.dropoffDate).trim() : "",
    pickupTime: data.pickupTime ? String(data.pickupTime).trim() : "",
    dropoffTime: data.dropoffTime ? String(data.dropoffTime).trim() : "",
    pickupLocation: data.pickupLocation ? String(data.pickupLocation).trim() : "",
    dropoffLocation: data.dropoffLocation
      ? String(data.dropoffLocation).trim()
      : "",

    // ✅ Financial information
    total: data.total ? Number(data.total) : FIELD_DEFAULTS.total,
    mco: data.mco ? Number(data.mco) : FIELD_DEFAULTS.mco,
    payableAtPickup: data.payableAtPickup
      ? Number(data.payableAtPickup)
      : FIELD_DEFAULTS.payableAtPickup,
    modificationFee: Array.isArray(data.modificationFee)
      ? data.modificationFee
      : FIELD_DEFAULTS.modificationFee,

    // ✅ Payment information
    cardLast4: String(data.cardLast4).trim(),
    expiration: String(data.expiration).trim(),
    billingAddress: String(data.billingAddress).trim(),

    // ✅ Booking metadata
    status: data.status ? String(data.status).trim() : FIELD_DEFAULTS.status,
    salesAgent: agentInfo.name || "Unknown Agent",
    agentId: agentInfo.id,
    isDeleted: false,

    // ✅ Timeline entry
    timeline: Array.isArray(data.timeline) && data.timeline.length > 0
      ? data.timeline
      : [
          {
            date: new Date().toISOString(),
            agentName: agentInfo.name || "Unknown Agent",
            message: "New booking created",
            changes: [],
          },
        ],
  };
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * GET /api/bookings
 * Retrieves all active (non-deleted) bookings sorted by creation date
 *
 * ✅ When to use: Fetching list of bookings for dashboard
 * Response: success() or unauthorized() or internalError()
 */
export async function GET(req: Request) {
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
    // STEP 2: Fetch bookings (excluding deleted ones)
    // ============================================================
    const bookings = await Booking.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean(); // ✅ Use lean() for better performance on read-only queries

    // ============================================================
    // STEP 3: Return success response
    // ============================================================
    return success(
      {
        bookings,
        totalCount: bookings.length,
      },
      `Retrieved ${bookings.length} booking(s)`,
      HttpStatus.OK
    );
  } catch (error: unknown) {
    console.error("❌ Get Bookings Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("connect")) {
        return internalError(
          "Database connection failed. Please try again later.",
          ErrorCode.DATABASE_ERROR,
          { originalError: error.message }
        );
      }

      return internalError(
        "Failed to retrieve bookings",
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
 * POST /api/bookings
 * Creates a new booking with required validation and timeline initialization
 *
 * ✅ When to use:
 *    - Creating a new rental booking
 *    - Recording new modification booking
 *    - Initializing booking timeline
 *
 * Request body: {
 *   fullName: string,
 *   email: string,
 *   phoneNumber: string,
 *   rentalCompany: string,
 *   cardLast4: string,
 *   expiration: string,
 *   billingAddress: string,
 *   // ... optional fields
 * }
 *
 * Response: success() or unauthorized() or badRequest() or unprocessableEntity()
 */
export async function POST(req: Request) {
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
    let data;
    try {
      data = await req.json();
    } catch {
      return badRequest(
        "Invalid JSON in request body",
        ErrorCode.VALIDATION_ERROR
      );
    }

    if (!data || typeof data !== "object") {
      return badRequest(
        "Request body must be a valid JSON object",
        ErrorCode.VALIDATION_ERROR
      );
    }

    // ============================================================
    // STEP 3: Validate required fields
    // ============================================================
    const missingFields = validateRequiredFields(data as Record<string, unknown>);

    if (missingFields.length > 0) {
      return badRequest(
        `Missing required fields: ${missingFields.join(", ")}`,
        ErrorCode.REQUIRED_FIELD,
        { missingFields }
      );
    }

    // ============================================================
    // STEP 4: Validate email format
    // ============================================================
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(data.email).trim())) {
      return badRequest(
        "Invalid email format",
        ErrorCode.INVALID_EMAIL,
        { email: data.email }
      );
    }

    // ============================================================
    // STEP 5: Create normalized payload
    // ============================================================
    const payload = createBookingPayload(
      data as Record<string, unknown>,
      {
        name: decoded.name || "Unknown Agent",
        id: decoded.id,
      }
    );

    // ============================================================
    // STEP 6: Create and save booking
    // ============================================================
    const booking = await Booking.create(payload);

    // ============================================================
    // STEP 7: Return success response with created booking
    // ============================================================
    return success(
      {
        booking,
        message: "Booking created successfully",
      },
      "New booking created with initial timeline entry",
      HttpStatus.CREATED // ✅ Use 201 for resource creation
    );
  } catch (error: unknown) {
    console.error("❌ Create Booking Error:", error);

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

      // Duplicate key errors
      if (error.message.includes("duplicate") || error.message.includes("E11000")) {
        return unprocessableEntity(
          "A booking with this email already exists",
          ErrorCode.CONFLICT,
          { originalError: error.message }
        );
      }

      return internalError(
        "Failed to create booking",
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