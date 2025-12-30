// lib/store/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import type {
  User,
  ITenantResponse,
  LoginCredentials,
  ApiResponse,
  ApiError,
  VerifyOtpResponse,
} from '@/lib/types';

import { RegisterTenantFormValues, VerifyOtpRequest } from '@/lib/validators/register.validator';
import { apiClient, parseApiError } from '@/lib/api/axiosInstance';


// ============================================================================
// TYPES
// ============================================================================

interface AuthState {
  // User data
  user: User | null;
  tenant: ITenantResponse | null;
  requiresVerification: boolean;
  registeredEmail: string | null;
  isAuthenticated: boolean;
  otpExpiresIn: Date | null;

  // Per-action states!
  loginLoading: boolean;
  loginError: ApiError | null;
  loginSuccessMsg: string | null;

  registerLoading: boolean;
  registerError: ApiError | null;
  registerSuccessMsg: string | null;

  verifyOtpLoading: boolean;
  verifyOtpError: string | null;
  verifyOtpSuccessMsg: string | null;

  logoutLoading: boolean;
  logoutError: ApiError | null;
  logoutSuccessMsg: string | null;

  fetchTenantLoading: boolean;
  fetchTenantError: ApiError | null;
  fetchTenantSuccessMsg: string | null;

  resendOtpLoading: boolean;
  resendOtpError: string | null;
  resendOtpSuccessMsg: string | null;

}

const initialState: AuthState = {
  user: null,
  tenant: null,
  requiresVerification: false,
  registeredEmail: null,
  isAuthenticated: false,
  otpExpiresIn: null,

  loginLoading: false,
  loginError: null,
  loginSuccessMsg: null,

  registerLoading: false,
  registerError: null,
  registerSuccessMsg: null,

  verifyOtpLoading: false,
  verifyOtpError: null,
  verifyOtpSuccessMsg: null,

  logoutLoading: false,
  logoutError: null,
  logoutSuccessMsg: null,

  fetchTenantLoading: false,
  fetchTenantError: null,
  fetchTenantSuccessMsg: null,

  resendOtpLoading: false,
  resendOtpError: null,
  resendOtpSuccessMsg: null,
};

// ============================================================================
// ASYNC THUNKS (The key to senior-level Redux)
// ============================================================================

/**
 * Register a new tenant
 *
 * Generic types:
 * - First: Return type (what we get from API)
 * - Second: Argument type (what we pass in)
 * - Third: Thunk API options
 */
export const registerTenantThunk = createAsyncThunk<
  ITenantResponse,                    // ✅ Return type: What API gives us
  RegisterTenantFormValues,                   // ✅ Argument type: What we send
  {
    rejectValue: ApiError;           // ✅ Reject type: What we store on error
  }
>(
  'auth/registerTenant',
  async (formData, { rejectWithValue }) => {
    try {
      // Make request using consistent axios instance
      const { data } = await apiClient.post<ApiResponse<ITenantResponse>>(
        '/api/auth/register',
        formData
      );
      console.log("response =", data)
      // Validate response structure
      if (!data?.data) {
        return rejectWithValue({
          code: 'INVALID_RESPONSE',
          message: 'Invalid server response',
          timestamp: new Date().toISOString(),
        });
      }

      // ✅ Return only what we need
      return data.data;
    } catch (error) {
      // ✅ Parse error into standardized format
      const parsedError = parseApiError(error);
      return rejectWithValue(parsedError as ApiError);
    }
  }
);

// Async thunk for email verification
export const verifyEmail = createAsyncThunk<
  ApiResponse<VerifyOtpResponse>,
  VerifyOtpRequest,
  { rejectValue: ApiError }
>(
  'auth/verifyEmail',
  async (payload, { rejectWithValue }) => {
    try {

      const { data } = await apiClient.post<ApiResponse<VerifyOtpResponse>>(
        '/api/auth/verify-otp',
        payload
      )

      // Validate response structure
      if (!data?.data) {
        return rejectWithValue({
          code: 'INVALID_RESPONSE',
          message: 'Invalid server response',
          timestamp: new Date().toISOString(),
        });
      }

      return data;
    } catch (error) {
      // ✅ Parse error into standardized format
      const parsedError = parseApiError(error);
      return rejectWithValue(parsedError as ApiError);
    }
  }
);

/**
 * Login user with email and password
 */
export const loginUserThunk = createAsyncThunk<
  User,
  LoginCredentials,
  { rejectValue: ApiError }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post<ApiResponse<{ user: User }>>(
      '/api/auth/login',
      credentials
    );

    if (!data?.data?.user) {
      return rejectWithValue({
        code: 'INVALID_RESPONSE',
        message: 'Invalid response structure',
        timestamp: new Date().toISOString(),
      });
    }

    // Store token in localStorage if returned
    // if (data?.data?.accessToken) {
    //   localStorage.setItem('accessToken', data.data.accessToken);
    // }

    return data.data.user;
  } catch (error) {
    return rejectWithValue(parseApiError(error) as ApiError);
  }
});



// Async thunk for resend OTP
// export const resendOtp = createAsyncThunk<
//   ApiResponse<ResendOtpResponseData>,
//   ResendOtpData,
//   { rejectValue: RejectedPayload }
// >(
//   'auth/resendOtp',
//   async (email, { rejectWithValue }) => {
//     try {
//       const response = await fetch('/api/auth/resend-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(email),
//       });

//       const data: ApiResponse<ResendOtpResponseData> = await response.json();

//       if (!response.ok) {
//         return rejectWithValue({
//           message: data.message || 'Failed to resend OTP',
//           status: response.status,
//           error: data.error,
//         });
//       }

//       return data;
//     } catch (err: unknown) {
//       const error = err as Error;
//       return rejectWithValue({
//         message: error.message || 'Network error',
//         status: 500,
//       });
//     }
//   }
// );

/**
 * Logout user
 */
export const logoutUserThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: ApiError }
>('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await apiClient.post('/api/auth/logout');
    localStorage.removeItem('accessToken');
  } catch (error) {
    localStorage.removeItem('accessToken'); // Clear even if API fails
    return rejectWithValue(parseApiError(error) as ApiError);
  }
});

/**
 * Fetch current authenticated user (restore session)
 */
export const fetchCurrentTenantThunk = createAsyncThunk<
  User,
  void,
  { rejectValue: ApiError }
>('auth/fetchCurrentTenantThunk', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get<ApiResponse<{ user: User }>>(
      '/api/auth/me'
    );

    if (!data?.data?.user) {
      return rejectWithValue({
        code: 'UNAUTHENTICATED',
        message: 'Not authenticated',
        timestamp: new Date().toISOString(),
      });
    }

    return data.data.user;
  } catch (error) {
    return rejectWithValue(parseApiError(error) as ApiError);
  }
});

// ============================================================================
// SLICE (Professional extraReducers pattern)
// ============================================================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Global clear for all errors (good for route changes/unmount)
    clearAllErrors: (state) => {
      state.loginError = null;
      state.registerError = null;
      state.verifyOtpError = null;
      state.logoutError = null;
      state.fetchTenantError = null;
      state.resendOtpError = null;
      // ...add any future error fields here as well
    },
    // Global clear for all success messages
    clearAllSuccess: (state) => {
      state.loginSuccessMsg = null;
      state.registerSuccessMsg = null;
      state.verifyOtpSuccessMsg = null;
      state.logoutSuccessMsg = null;
      state.fetchTenantSuccessMsg = null;
      state.resendOtpSuccessMsg = null;
      // ...add any future success fields here as well
    },
    // Optional: clear error per-action
    clearLoginError: (state) => { state.loginError = null; },
    clearRegisterError: (state) => { state.registerError = null; },
    clearVerifyOtpError: (state) => { state.verifyOtpError = null; },
    clearLogoutError: (state) => { state.logoutError = null; },
    clearResendOtpError: (state) => { state.resendOtpError = null; },
    clearfetchTenantError: (state) => { state.fetchTenantError = null; },

    // Optional: clear success per-action
    clearLoginSuccess: (state) => { state.loginSuccessMsg = null; },
    clearRegisterSuccess: (state) => { state.registerSuccessMsg = null; },
    clearVerifyOtpSuccess: (state) => { state.verifyOtpSuccessMsg = null; },
    clearLogoutSuccess: (state) => { state.logoutSuccessMsg = null; },
    clearResendOtpSuccess: (state) => { state.resendOtpSuccessMsg = null; },
    clearfetchTenantSuccess: (state) => { state.fetchTenantSuccessMsg = null; },

    // (Optional) for toast-driven resets on navigation:
    resetAuthUi: (state) => {
      // This can clear all error/success/loading in one reducer if you want
      state.loginError = null;
      state.registerError = null;
      state.verifyOtpError = null;
      state.logoutError = null;
      state.fetchTenantError = null;
      state.resendOtpError = null;
      state.loginSuccessMsg = null;
      state.registerSuccessMsg = null;
      state.verifyOtpSuccessMsg = null;
      state.logoutSuccessMsg = null;
      state.fetchTenantSuccessMsg = null;
      state.resendOtpSuccessMsg = null;
      state.loginLoading = false;
      state.registerLoading = false;
      state.verifyOtpLoading = false;
      state.logoutLoading = false;
      state.fetchTenantLoading = false;
      state.resendOtpLoading = false;
    }
  },
  extraReducers: (builder) => {
    // ======================================================================
    // REGISTER TENANT
    // ======================================================================
    builder
      .addCase(registerTenantThunk.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
      })
      .addCase(
        registerTenantThunk.fulfilled,
        (state, action: PayloadAction<ITenantResponse>) => {
          console.log("payload =", action)
          state.registerLoading = false;
          state.registerError = null;
          const data = action?.payload;
          if (data?.requiresVerification) {
            state.tenant = action.payload;
            state.requiresVerification = action.payload.requiresVerification;
            state.registeredEmail = data?.email;
            state.registerSuccessMsg =  "Registered successfully!";
            const expires = data?.otpExpiresIn;
            state.otpExpiresIn = expires ? new Date(expires) : null;
           }
        }
      )
      .addCase(
        registerTenantThunk.rejected,
        (state, action: PayloadAction<ApiError | undefined>) => {
          state.registerLoading = false;
          state.registerError = action.payload || {
            code: 'UNKNOWN_ERROR',
            message: 'Registration failed',
            timestamp: new Date().toISOString(),
          };
        }
      )

      // ======================================================================
      // LOGIN
      // ======================================================================

      .addCase(loginUserThunk.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
      })
      .addCase(
        loginUserThunk.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loginLoading = false;
          state.user = action.payload;
          state.isAuthenticated = true;
          state.loginError = null;
        }
      )
      .addCase(
        loginUserThunk.rejected,
        (state, action: PayloadAction<ApiError | undefined>) => {
          state.loginLoading = false;
          state.loginError = action.payload || {
            code: 'LOGIN_FAILED',
            message: 'Login failed',
            timestamp: new Date().toISOString(),
          };
          state.isAuthenticated = false;
        }
      )

      // ======================================================================
      // LOGOUT
      // ======================================================================

      .addCase(logoutUserThunk.pending, (state) => {
        state.logoutLoading = true;
        state.logoutError = null;
      })
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.logoutLoading = false;
        state.user = null;
        state.tenant = null;
        state.isAuthenticated = false;
        state.logoutError = null;
      })
      .addCase(
        logoutUserThunk.rejected,
        (state, action: PayloadAction<ApiError | undefined>) => {
          state.logoutLoading = false;
          state.logoutError = action.payload || {
            code: 'LOGOUT_FAILED',
            message: 'Logout failed',
            timestamp: new Date().toISOString(),
          };
          // Still clear local user even if API fails
          state.user = null;
          state.isAuthenticated = false;
        }
      )
      // Verify email
      .addCase(verifyEmail.pending, (state) => {
        state.verifyOtpLoading = true;
        state.verifyOtpError = null;
        state.verifyOtpSuccessMsg = null
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.verifyOtpLoading = false;
        state.verifyOtpError = null;

        state.requiresVerification = false;
        state.registeredEmail = null;
        state.isAuthenticated = true;
        state.verifyOtpSuccessMsg = action.payload.message || "Email verified!";
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.verifyOtpLoading = false;
        state.isAuthenticated = true;
        state.verifyOtpError = action.payload?.message || 'Verification failed';
        state.verifyOtpSuccessMsg = null
      })
    // Resend OTP
    // .addCase(resendOtp.pending, (state) => {
    //   state.resendOtpLoading = true;
    //   state.resendOtpError = null;
    // })
    // .addCase(resendOtp.fulfilled, (state, action) => {
    //   state.resendOtpLoading = false;
    //   state.resendOtpError = null;
    //   state.resendOtpSuccessMsg = action.payload.message;
    //   const expires = action.payload.data?.otpExpires;
    //   state.otpExpires = expires ? new Date(expires) : null;
    // })
    // .addCase(resendOtp.rejected, (state, action) => {
    //   state.resendOtpLoading = false;
    //   state.resendOtpError = action.payload?.message || 'Failed to resend OTP';
    // })

    // ======================================================================
    // FETCH CURRENT USER
    // ======================================================================
    builder
      .addCase(fetchCurrentTenantThunk.pending, (state) => {
        state.fetchTenantLoading = true;
        state.fetchTenantError = null;
      })
      .addCase(
        fetchCurrentTenantThunk.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.fetchTenantLoading = false;
          state.user = action.payload;
          state.isAuthenticated = true;
          state.fetchTenantError = null;
        }
      )
      .addCase(
        fetchCurrentTenantThunk.rejected,
        (state, action: PayloadAction<ApiError | undefined>) => {
          state.fetchTenantLoading = false;
          state.user = null;
          state.isAuthenticated = false;
          state.fetchTenantError = action.payload || {
            code: 'FETCH_USER_FAILED',
            message: 'Failed to fetch user',
            timestamp: new Date().toISOString(),
          };
        }
      );
  },
});

// Export actions
// Export actions (place after your createSlice definition)
export const {
  clearAllErrors,
  clearAllSuccess,
  clearLoginError,
  clearRegisterError,
  clearVerifyOtpError,
  clearLogoutError,
  clearResendOtpError,
  clearfetchTenantError,
  clearLoginSuccess,
  clearRegisterSuccess,
  clearVerifyOtpSuccess,
  clearLogoutSuccess,
  clearResendOtpSuccess,
  clearfetchTenantSuccess,
  resetAuthUi // if using the global UI reset/cleanup
} = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectRequiresVerification = (state: { auth: AuthState }) => state.auth.requiresVerification;
export const selectRegisteredEmail = (state: { auth: AuthState }) => state.auth.registeredEmail;

export default authSlice.reducer;
