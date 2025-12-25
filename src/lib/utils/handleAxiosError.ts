// lib/utils/handleAxiosError.ts
import axios, { AxiosError } from "axios";
import type { ApiResponse } from "@/lib/types/api";

export function handleAxiosError(
  err: unknown,
  defaultMessage = "Something went wrong"
): string {
  // ✅ Axios error
  if (axios.isAxiosError(err)) {
    const error = err as AxiosError<ApiResponse>;

    const response = error.response;
    const data = response?.data;

    // 1️⃣ Backend message (highest priority)
    if (data?.message) {
      return data.message;
    }

    // 2️⃣ Backend error code (fallback)
    if (data?.error?.code) {
      return data.error.code;
    }

    // 3️⃣ HTTP status based fallback
    if (response?.status === 401) {
      return "Unauthorized. Please login again.";
    }

    if (response?.status === 403) {
      return "You don’t have permission to perform this action.";
    }

    if (response?.status === 500) {
      return "Server error. Please try again later.";
    }
  }

  // ❌ Non-Axios / unknown error
  return defaultMessage;
}
