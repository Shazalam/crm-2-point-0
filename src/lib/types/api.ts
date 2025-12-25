// lib/types/api.ts
/**
 * Standard API response envelope returned by all backend endpoints
 * This matches the ApiResponse structure from apiResponse.ts
 */

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error' | 'validation_error' | 'authentication_error';
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
    stack?: string;
  };
  meta?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}


/**
 * Parsed error for Redux state
 * More usable than raw Axios errors
 */
export interface ParsedError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
  status?: number;
  timestamp: string;
}

/**
 * Validation errors format
 * Maps field names to error messages
 */
export interface ValidationErrors {
  errors: Record<string, string[]>;
}
