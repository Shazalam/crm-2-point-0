// import { IITenantResponse } from '@/lib/types/tenant';
// import { handleAxiosError } from '@/lib/utils/handleAxiosError';
// import {type RegisterTenantFormValues } from '@/lib/validators/register.validator';
// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// interface LoginResponse {
//   success: boolean;
//   message: string;
//   data: User;
// }

// export interface User {
//   id?: string;
//   name: string;
//   email: string;
//   avatar?: string
// }

// interface AuthState {
//   user: User | null;
//   loading: boolean;
//   error: string | null;
//   success: boolean;
// }

// const initialState: AuthState = {
//   user: null,
//   loading: false,
//   error: null,
//   success: false,
// };

// // 🔐 Register
// export const registerTenantThunk  = createAsyncThunk<
// IITenantResponse,
//   RegisterTenantFormValues,
//   { rejectValue: string }
// >('auth/register', async (formData, { rejectWithValue }) => {
//   try {
//     const res = await fetch('/api/auth/register', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(formData),
//     });
//     const data = await res.json();
//     if (!res.ok) return rejectWithValue(data.error || 'Registration failed');
//     return { name: formData.name, email: formData.email };
//   } catch {
//     return rejectWithValue('Something went wrong');
//   }
// });

// // 🔐 Login
// export const loginUser = createAsyncThunk<
//   LoginResponse,
//   { email: string; password: string },
//   { rejectValue: string }
// >('auth/login', async (formData, { rejectWithValue }) => {
//   try {
//     const { data } = await axios.post('/api/auth/login', formData);
//     console.log("login data =>", data)
//     if (!data.success) {
//       return rejectWithValue(data.message || 'Invalid credentials');
//     }
//     return data;
//   } catch (err) {
//     console.log("login error =>", err)
//     return rejectWithValue(handleAxiosError(err, 'Network error'));
//   }
// });

// // 🚪 Logout
// export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
//   'auth/logout',
//   async (_, thunkAPI) => {
//     try {
//       const res = await fetch('/api/auth/logout', { method: 'POST' });
//       if (!res.ok) return thunkAPI.rejectWithValue('Logout failed');
//     } catch {
//       return thunkAPI.rejectWithValue('Logout failed');
//     }
//   }
// );

// // 🧠 Get Current User
// export const fetchCurrentUserThunk? = createAsyncThunk<User, void, { rejectValue: string }>(
//   'auth/me',
//   async (_, thunkAPI) => {
//     try {
//       const res = await fetch('/api/auth/me', { credentials: 'include' });
//       const data = await res.json();
//       if (!res.ok) return thunkAPI.rejectWithValue('Not authorized');
//       return data.data as User;
//     } catch {
//       return thunkAPI.rejectWithValue('Auth check failed');
//     }
//   }
// );

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     resetAuthState: (state) => {
//       state.error = null;
//       state.success = false;
//       state.loading = false;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // 🔐 Login
//       .addCase(loginUser.pending, (s) => {
//         s.loading = true; s.error = null;
//       })
//       .addCase(loginUser.fulfilled, (s, a: PayloadAction<LoginResponse>) => {
//         s.loading = false; s.user = a.payload.data; s.success = true;
//       })
//       .addCase(loginUser.rejected, (s, a) => {
//         s.loading = false; s.error = a.payload as string;
//       })

//       // 📝 Register
//       .addCase(registerTenantThunk .pending, (s) => {
//         s.loading = true; s.error = null;
//         toast.dismiss(); toast.loading('Registering...');
//       })
//       .addCase(registerTenantThunk .fulfilled, (s, a: PayloadAction<User>) => {
//         s.loading = false; s.user = a.payload; s.success = true;
//         toast.dismiss(); toast.success('Registered successfully ✅');
//       })
//       .addCase(registerTenantThunk .rejected, (s, a) => {
//         s.loading = false; s.error = a.payload as string;
//         toast.dismiss(); toast.error(a.payload as string || 'Registration failed ❌');
//       })

//       // 🧠 Current User
//       .addCase(fetchCurrentUserThunk?.pending, (s) => {
//         s.loading = true; s.error = null;
//       })
//       .addCase(fetchCurrentUserThunk?.fulfilled, (s, a: PayloadAction<User>) => {
//         s.user = a.payload; s.success = true; s.loading = false;
//       })
//       .addCase(fetchCurrentUserThunk?.rejected, (s) => {
//         s.user = null; s.success = false; s.loading = false;
//       })

//       // 🚪 Logout
//       .addCase(logoutUser.pending, (s) => {
//         s.loading = true; s.error = null;
//       })
//       .addCase(logoutUser.fulfilled, (s) => {
//         s.user = null; s.success = false; s.loading = false;
//       })
//       .addCase(logoutUser.rejected, (s) => {
//         s.user = null; s.success = false; s.loading = false;
//       });
//   },
// });

// export const { resetAuthState } = authSlice.actions;
// export default authSlice.reducer;






// lib/store/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import type {
  User,
  ITenantResponse,
  LoginCredentials,
  ApiResponse,
  ApiError,
} from '@/lib/types';
import { RegisterTenantFormValues } from '@/lib/validators/register.validator';
import { apiClient, parseApiError } from '@/lib/api/axiosInstance';

// ============================================================================
// TYPES
// ============================================================================

interface AuthState {
  // User data
  user: User | null;
  tenant: ITenantResponse | null;
  isAuthenticated: boolean;

  // Loading states per action (professional way!)
  registerLoading: boolean;
  loginLoading: boolean;
  logoutLoading: boolean;
  fetchUserLoading: boolean;

  // Error states per action (detailed error info)
  registerError: ApiError | null;
  loginError: ApiError | null;
  logoutError: ApiError | null;
  fetchUserError: ApiError | null;
}

const initialState: AuthState = {
  user: null,
  tenant: null,
  isAuthenticated: false,

  registerLoading: false,
  loginLoading: false,
  logoutLoading: false,
  fetchUserLoading: false,

  registerError: null,
  loginError: null,
  logoutError: null,
  fetchUserError: null,
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
export const fetchCurrentUserThunk = createAsyncThunk<
  User,
  void,
  { rejectValue: ApiError }
>('auth/fetchCurrentUserThunk', async (_, { rejectWithValue }) => {
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
    // ✅ Actions for manual state management
    resetAuthState: () => initialState,
    clearRegisterError: (state) => {
      state.registerError = null;
    },
    clearLoginError: (state) => {
      state.loginError = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
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
          state.registerLoading = false;
          state.tenant = action.payload;
          state.registerError = null;
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
      );

    // ======================================================================
    // LOGIN
    // ======================================================================
    builder
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
      );

    // ======================================================================
    // LOGOUT
    // ======================================================================
    builder
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
      );

    // ======================================================================
    // FETCH CURRENT USER
    // ======================================================================
    builder
      .addCase(fetchCurrentUserThunk.pending, (state) => {
        state.fetchUserLoading = true;
        state.fetchUserError = null;
      })
      .addCase(
        fetchCurrentUserThunk.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.fetchUserLoading = false;
          state.user = action.payload;
          state.isAuthenticated = true;
          state.fetchUserError = null;
        }
      )
      .addCase(
        fetchCurrentUserThunk.rejected,
        (state, action: PayloadAction<ApiError | undefined>) => {
          state.fetchUserLoading = false;
          state.user = null;
          state.isAuthenticated = false;
          state.fetchUserError = action.payload || {
            code: 'FETCH_USER_FAILED',
            message: 'Failed to fetch user',
            timestamp: new Date().toISOString(),
          };
        }
      );
  },
});

export const { resetAuthState, clearRegisterError, clearLoginError, setUser } =
  authSlice.actions;
export default authSlice.reducer;
