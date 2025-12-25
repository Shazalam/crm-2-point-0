// lib/types/errors.ts
/**
 * All possible error codes from backend
 * Used for error mapping and handling
 */
export enum ErrorCode {
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_EMAIL = 'INVALID_EMAIL',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  REQUIRED_FIELD = 'REQUIRED_FIELD',

  // Authentication
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',

  // Conflict
  TENANT_EMAIL_EXISTS = 'TENANT_EMAIL_EXISTS',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

/**
 * Error code to user message mapping
 * Shows friendly messages instead of codes
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCode.INVALID_EMAIL]: 'Please enter a valid email address.',
  [ErrorCode.WEAK_PASSWORD]: 'Password must contain uppercase, lowercase, number, and special character.',
  [ErrorCode.REQUIRED_FIELD]: 'All required fields must be filled.',
  [ErrorCode.UNAUTHENTICATED]: 'Please log in to continue.',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password.',
  [ErrorCode.EXPIRED_TOKEN]: 'Your session has expired. Please log in again.',
  [ErrorCode.TENANT_EMAIL_EXISTS]: 'This email is already registered.',
  [ErrorCode.ALREADY_EXISTS]: 'This resource already exists.',
  [ErrorCode.INTERNAL_ERROR]: 'Something went wrong. Please try again later.',
  [ErrorCode.DATABASE_ERROR]: 'Database error. Please try again later.',
};

/**
 * Centralized error type for all Redux operations
 */
export interface ApiError {
  code: ErrorCode | string;
  message: string;
  details?: Record<string, string[]>;
  validationErrors?: Record<string, string[]>;
  timestamp: string;
}
