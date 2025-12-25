
import RentalCompany from "@/lib/models/RentalCompany";
import { connectDB } from "@/lib/utils/db";
import {
  badRequest,
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
 * Default rental company to ensure at least one exists
 */
const DEFAULT_COMPANY_NAME = "Other";

/**
 * Regex pattern for validating company names
 * Allows letters, numbers, spaces, and common characters
 */
const COMPANY_NAME_PATTERN = /^[a-zA-Z0-9\s\-&.'()]+$/;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates rental company name format
 * @param name - The company name to validate
 * @returns true if valid, false otherwise
 */
function isValidCompanyName(name: string): boolean {
  const trimmed = String(name).trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= 100 &&
    COMPANY_NAME_PATTERN.test(trimmed)
  );
}

/**
 * Creates a case-insensitive regex pattern for searching company names
 * @param name - The company name to search for
 * @returns RegExp object for case-insensitive matching
 */
function createCaseInsensitiveRegex(name: string): RegExp {
  const escapedName = String(name).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escapedName}$`, "i");
}

/**
 * Ensures the default "Other" company exists in the database
 */
async function ensureDefaultCompanyExists(): Promise<void> {
  const count = await RentalCompany.countDocuments();

  if (count === 0) {
    await RentalCompany.create({ name: DEFAULT_COMPANY_NAME });
  }
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * GET /api/rental-companies
 * Retrieves all rental companies sorted alphabetically
 *
 * ✅ When to use:
 *    - Populating rental company dropdown/select list
 *    - Loading company data for dashboard
 *    - Displaying available companies to users
 *
 * Response: success() or internalError()
 */
export async function GET() {
  try {
    await connectDB();

    // ============================================================
    // STEP 1: Ensure default company exists
    // ============================================================
    await ensureDefaultCompanyExists();

    // ============================================================
    // STEP 2: Fetch all companies sorted alphabetically
    // ============================================================
    const companies = await RentalCompany.find()
      .sort({ name: 1 })
      .lean(); // ✅ Use lean() for better performance on read-only queries

    // ============================================================
    // STEP 3: Return success response
    // ============================================================
    return success(
      {
        companies,
        totalCount: companies.length,
      },
      `Retrieved ${companies.length} rental company/companies`,
      HttpStatus.OK
    );
  } catch (error: unknown) {
    console.error("❌ Get Rental Companies Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("connect")) {
        return internalError(
          "Database connection failed. Please try again later.",
          ErrorCode.DATABASE_ERROR,
          { originalError: error.message }
        );
      }

      return internalError(
        "Failed to retrieve rental companies",
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
 * POST /api/rental-companies
 * Creates a new rental company with duplicate prevention
 *
 * ✅ When to use:
 *    - Adding a new rental company to the system
 *    - User input for custom company not in the list
 *    - Bulk importing rental companies
 *
 * Request body: {
 *   name: string  // Company name (required, non-empty)
 * }
 *
 * Response: success() or badRequest() or unprocessableEntity() or internalError()
 */
export async function POST(req: Request) {
  try {
    await connectDB();

    // ============================================================
    // STEP 1: Parse and validate request body
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
    // STEP 2: Validate company name field
    // ============================================================
    if (!data.name || typeof data.name !== "string") {
      return badRequest(
        "Company name is required and must be a string",
        ErrorCode.REQUIRED_FIELD,
        { field: "name" }
      );
    }

    const trimmedName = String(data.name).trim();

    // ============================================================
    // STEP 3: Validate company name format
    // ============================================================
    if (!isValidCompanyName(trimmedName)) {
      return badRequest(
        "Company name must be between 1-100 characters and contain only letters, numbers, spaces, and common characters (-&.'())",
        ErrorCode.VALIDATION_ERROR,
        {
          providedName: trimmedName,
          maxLength: 100,
          allowedCharacters: "letters, numbers, spaces, -&.'()",
        }
      );
    }

    // ============================================================
    // STEP 4: Check for duplicate company (case-insensitive)
    // ============================================================
    const duplicateRegex = createCaseInsensitiveRegex(trimmedName);
    const existingCompany = await RentalCompany.findOne({
      name: duplicateRegex,
    });

    if (existingCompany) {
      return unprocessableEntity(
        "This rental company already exists. Please select it from the list or use 'Other'",
        ErrorCode.ALREADY_EXISTS,
        {
          existingCompanyId: existingCompany._id,
          existingCompanyName: existingCompany.name,
        }
      );
    }

    // ============================================================
    // STEP 5: Create and save new company
    // ============================================================
    const newCompany = await RentalCompany.create({
      name: trimmedName,
    });

    // ============================================================
    // STEP 6: Return success response with created company
    // ============================================================
    return success(
      {
        company: newCompany,
      },
      "Rental company created successfully",
      HttpStatus.CREATED // ✅ Use 201 for resource creation
    );
  } catch (error: unknown) {
    console.error("❌ Create Rental Company Error:", error);

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
          "Company validation failed",
          ErrorCode.VALIDATION_ERROR,
          { originalError: error.message }
        );
      }

      // Duplicate key errors (from unique indexes)
      if (
        error.message.includes("duplicate") ||
        error.message.includes("E11000")
      ) {
        return unprocessableEntity(
          "A rental company with this name already exists",
          ErrorCode.ALREADY_EXISTS,
          { originalError: error.message }
        );
      }

      return internalError(
        "Failed to create rental company",
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