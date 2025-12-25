// lib/types/auth.ts
/**
 * User object in Redux state
 * Only non-sensitive data that's safe to store client-side
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * Login credentials (frontend sends this)
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login response from backend
 * Matches the /api/auth/login response
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

/**
 * Logout response (usually empty)
 */
export interface LogoutResponse {
  message: string;
}

/**
 * Current user response from /api/auth/me
 */
export interface MeResponse {
  user: User;
}
