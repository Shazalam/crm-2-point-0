// lib/utils/axios.ts
import axios, { AxiosError } from 'axios';
import type { ApiResponse, ParsedError } from '@/lib/types';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000,
  withCredentials: true,
});

/**
 * Parse Axios error into consistent ParsedError format
 * This standardizes all error types from the backend
 */
export function parseApiError(error: unknown): ParsedError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse | undefined;

    return {
      message: data?.message || error.message,
      code: data?.error?.code || error.code || 'UNKNOWN_ERROR',
      details: (data?.error?.details as Record<string, string[]>) || undefined,
      status: error.response?.status,
      timestamp: data?.meta?.timestamp || new Date().toISOString(),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'NETWORK_ERROR',
      timestamp: new Date().toISOString(),
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
  };
}
