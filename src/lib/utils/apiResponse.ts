import { NextResponse } from "next/server";

export function apiResponse<T>(
  data: T,
  status: number = 200,
  headers: Record<string, string> = {}
) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}




// import { NextResponse } from "next/server";

// // Response status types
// export type ApiStatus = 'success' | 'error' | 'validation_error' | 'authentication_error' | 'authorization_error' | 'not_found' | 'rate_limited' | 'server_error';

// // Standard API response interface
// export interface ApiResponse<T = unknown> {
//   status: ApiStatus;
//   message: string;
//   data?: T;
//   error?: {
//     code: string;
//     details?: unknown;
//     stack?: string;
//   };
//   meta?: {
//     timestamp: string;
//     version: string;
//     requestId?: string;
//     pagination?: {
//       page: number;
//       limit: number;
//       total: number;
//       pages: number;
//     };
//   };
// }

// // HTTP Status codes
// export const HttpStatus = {
//   OK: 200,
//   CREATED: 201,
//   ACCEPTED: 202,
//   NO_CONTENT: 204,
//   BAD_REQUEST: 400,
//   UNAUTHORIZED: 401,
//   FORBIDDEN: 403,
//   NOT_FOUND: 404,
//   METHOD_NOT_ALLOWED: 405,
//   CONFLICT: 409,
//   UNPROCESSABLE_ENTITY: 422,
//   TOO_MANY_REQUESTS: 429,
//   INTERNAL_SERVER_ERROR: 500,
//   SERVICE_UNAVAILABLE: 503,
// } as const;

// // Error codes for different scenarios
// export const ErrorCode = {
//   // Validation errors
//   VALIDATION_ERROR: 'VALIDATION_ERROR',
//   REQUIRED_FIELD: 'REQUIRED_FIELD',
//   INVALID_EMAIL: 'INVALID_EMAIL',
//   INVALID_PASSWORD: 'INVALID_PASSWORD',
  
//   // Authentication errors
//   UNAUTHENTICATED: 'UNAUTHENTICATED',
//   INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
//   EXPIRED_TOKEN: 'EXPIRED_TOKEN',
//   INVALID_TOKEN: 'INVALID_TOKEN',
  
//   // Authorization errors
//   UNAUTHORIZED: 'UNAUTHORIZED',
//   INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
//   // Resource errors
//   NOT_FOUND: 'NOT_FOUND',
//   ALREADY_EXISTS: 'ALREADY_EXISTS',
//   CONFLICT: 'CONFLICT',
  
//   // System errors
//   INTERNAL_ERROR: 'INTERNAL_ERROR',
//   EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
//   DATABASE_ERROR: 'DATABASE_ERROR',
  
//   // Rate limiting
//   RATE_LIMITED: 'RATE_LIMITED',
  
//   // Business logic errors
//   BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
//   INVALID_OPERATION: 'INVALID_OPERATION',
// } as const;

// // Configuration
// const config = {
//   includeStackTrace: process.env.NODE_ENV === 'development',
//   version: process.env.APP_VERSION || '1.0.0',
// };

// // Request context for better logging and tracing
// export interface RequestContext {
//   requestId?: string;
//   userId?: string;
//   userAgent?: string;
//   ipAddress?: string;
// }

// // Helper function to create success response
// function createSuccessResponse<T>(
//   data: T,
//   message: string = 'Success',
//   statusCode: number = HttpStatus.OK,
//   meta?: ApiResponse<T>['meta']
// ): NextResponse {
//   const response: ApiResponse<T> = {
//     status: 'success',
//     message,
//     data,
//     meta: {
//       timestamp: new Date().toISOString(),
//       version: config.version,
//       ...meta,
//     },
//   };

//   return new NextResponse(JSON.stringify(response), {
//     status: statusCode,
//     headers: {
//       'Content-Type': 'application/json',
//       'X-API-Version': config.version,
//     },
//   });
// }

// // Helper function to create error response
// function createErrorResponse(
//   status: ApiStatus,
//   message: string,
//   statusCode: number,
//   errorCode: string,
//   details?: unknown,
//   context?: RequestContext
// ): NextResponse {
//   const response: ApiResponse = {
//     status,
//     message,
//     error: {
//       code: errorCode,
//       details,
//       ...(config.includeStackTrace && { stack: new Error().stack }),
//     },
//     meta: {
//       timestamp: new Date().toISOString(),
//       version: config.version,
//       requestId: context?.requestId,
//     },
//   };

//   return new NextResponse(JSON.stringify(response), {
//     status: statusCode,
//     headers: {
//       'Content-Type': 'application/json',
//       'X-API-Version': config.version,
//     },
//   });
// }

// // Main API Response Functions
// export const ApiResponse = {
//   // Success responses
//   success<T>(
//     data: T,
//     message: string = 'Operation completed successfully',
//     statusCode: number = HttpStatus.OK,
//     meta?: ApiResponse<T>['meta']
//   ): NextResponse {
//     return createSuccessResponse(data, message, statusCode, meta);
//   },

//   created<T>(
//     data: T,
//     message: string = 'Resource created successfully',
//     meta?: ApiResponse<T>['meta']
//   ): NextResponse {
//     return createSuccessResponse(data, message, HttpStatus.CREATED, meta);
//   },

//   accepted<T>(
//     data: T,
//     message: string = 'Request accepted for processing',
//     meta?: ApiResponse<T>['meta']
//   ): NextResponse {
//     return createSuccessResponse(data, message, HttpStatus.ACCEPTED, meta);
//   },

//   noContent(message: string = 'No content'): NextResponse {
//     return createSuccessResponse(undefined, message, HttpStatus.NO_CONTENT);
//   },

//   // Error responses
//   badRequest(
//     message: string = 'Bad request',
//     errorCode: string = ErrorCode.VALIDATION_ERROR,
//     details?: unknown,
//     context?: RequestContext
//   ): NextResponse {
//     return createErrorResponse('validation_error', message, HttpStatus.BAD_REQUEST, errorCode, details, context);
//   },

//   unauthorized(
//     message: string = 'Authentication required',
//     errorCode: string = ErrorCode.UNAUTHENTICATED,
//     details?: unknown,
//     context?: RequestContext
//   ): NextResponse {
//     return createErrorResponse('authentication_error', message, HttpStatus.UNAUTHORIZED, errorCode, details, context);
//   },

//   forbidden(
//     message: string = 'Insufficient permissions',
//     errorCode: string = ErrorCode.UNAUTHORIZED,
//     details?: unknown,
//     context?: RequestContext
//   ): NextResponse {
//     return createErrorResponse('authorization_error', message, HttpStatus.FORBIDDEN, errorCode, details, context);
//   },

//   notFound(
//     message: string = 'Resource not found',
//     errorCode: string = ErrorCode.NOT_FOUND,
//     details?: unknown,
//     context?: RequestContext
//   ): NextResponse {
//     return createErrorResponse('not_found', message, HttpStatus.NOT_FOUND, errorCode, details, context);
//   },
   
//   conflict(
//     message: string = 'Resource conflict',
//     errorCode: string = ErrorCode.CONFLICT,
//     details?: unknown,
//     context?: RequestContext
//   ): NextResponse {
//     return createErrorResponse('error', message, HttpStatus.CONFLICT, errorCode, details, context);
//   },

//   unprocessableEntity(
//     message: string = 'Unprocessable entity',
//     errorCode: string = ErrorCode.VALIDATION_ERROR,
//     details?: unknown,
//     context?: RequestContext
//   ): NextResponse {
//     return createErrorResponse('validation_error', message, HttpStatus.UNPROCESSABLE_ENTITY, errorCode, details, context);
//   },

//   tooManyRequests(
//     message: string = 'Too many requests',
//     errorCode: string = ErrorCode.RATE_LIMITED,
//     details?: unknown,
//     context?: RequestContext
//   ): NextResponse {
//     return createErrorResponse('rate_limited', message, HttpStatus.TOO_MANY_REQUESTS, errorCode, details, context);
//   },

//   internalError(
//     message: string = 'Internal server error',
//     errorCode: string = ErrorCode.INTERNAL_ERROR,
//     details?: unknown,
//     context?: RequestContext
//   ): NextResponse {
//     return createErrorResponse('server_error', message, HttpStatus.INTERNAL_SERVER_ERROR, errorCode, details, context);
//   },

//   // Custom error response
//   error(
//     status: ApiStatus,
//     message: string,
//     statusCode: number,
//     errorCode: string,
//     details?: unknown,
//     context?: RequestContext
//   ): NextResponse {
//     return createErrorResponse(status, message, statusCode, errorCode, details, context);
//   },

//   // Validation error helper
//   validationError(
//     errors: Record<string, string[]>,
//     message: string = 'Validation failed',
//     context?: RequestContext
//   ): NextResponse {
//     return createErrorResponse(
//       'validation_error',
//       message,
//       HttpStatus.BAD_REQUEST,
//       ErrorCode.VALIDATION_ERROR,
//       { errors },
//       context
//     );
//   },
// };

// // Convenience exports - you can use these directly
// export const {
//   success,
//   created,
//   accepted,
//   noContent,
//   badRequest,
//   unauthorized,
//   forbidden,
//   notFound,
//   conflict,
//   unprocessableEntity,
//   tooManyRequests,
//   internalError,
//   error,
//   validationError,
// } = ApiResponse;

// // Helper functions for response checking
// export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { status: 'success' } {
//   return response.status === 'success';
// }

// export function isErrorResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { status: Exclude<ApiStatus, 'success'> } {
//   return response.status !== 'success';
// }

// export function getErrorMessage(response: ApiResponse): string {
//   return response.message || 'An unexpected error occurred';
// }

// export function getErrorDetails(response: ApiResponse): unknown {
//   return response.error?.details;
// }

// // Simple utility for common responses
// export const ApiResponseFactory = {
//   // Quick success responses
//   ok<T>(data: T, message?: string) {
//     return ApiResponse.success(data, message);
//   },
  
//   created<T>(data: T, message?: string) {
//     return ApiResponse.created(data, message);
//   },
  
//   // Quick error responses
//   badRequest(message: string, details?: unknown) {
//     return ApiResponse.badRequest(message, ErrorCode.VALIDATION_ERROR, details);
//   },
  
//   unauthorized(message?: string) {
//     return ApiResponse.unauthorized(message || 'Please login to continue');
//   },
  
//   notFound(message?: string) {
//     return ApiResponse.notFound(message || 'Resource not found');
//   },
  
//   serverError(message?: string) {
//     return ApiResponse.internalError(message || 'Something went wrong');
//   },
// };

