import { ITenantResponse } from '@/lib/types/tenant';
import { handleAxiosError } from '@/lib/utils/handleAxiosError';
import {type RegisterTenantFormValues } from '@/lib/validators/register.validator';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

interface LoginResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  avatar?: string
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  success: false,
};

// 🔐 Register
export const registerTenantThunk  = createAsyncThunk<
  RegisterTenantFormValues,
  ITenantResponse,
  { rejectValue: string }
>('auth/register', async (formData, thunkAPI) => {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) return thunkAPI.rejectWithValue(data.error || 'Registration failed');
    return { name: formData.name, email: formData.email };
  } catch {
    return thunkAPI.rejectWithValue('Something went wrong');
  }
});

// 🔐 Login
export const loginUser = createAsyncThunk<
  LoginResponse,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/api/auth/login', formData);
    console.log("login data =>", data)
    if (!data.success) {
      return rejectWithValue(data.message || 'Invalid credentials');
    }
    return data;
  } catch (err) {
    console.log("login error =>", err)
    return rejectWithValue(handleAxiosError(err, 'Network error'));
  }
});

// 🚪 Logout
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) return thunkAPI.rejectWithValue('Logout failed');
    } catch {
      return thunkAPI.rejectWithValue('Logout failed');
    }
  }
);

// 🧠 Get Current User
export const fetchCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/me',
  async (_, thunkAPI) => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) return thunkAPI.rejectWithValue('Not authorized');
      return data.data as User;
    } catch {
      return thunkAPI.rejectWithValue('Auth check failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.error = null;
      state.success = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔐 Login
      .addCase(loginUser.pending, (s) => {
        s.loading = true; s.error = null;
      })
      .addCase(loginUser.fulfilled, (s, a: PayloadAction<LoginResponse>) => {
        s.loading = false; s.user = a.payload.data; s.success = true;
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false; s.error = a.payload as string;
      })

      // 📝 Register
      .addCase(registerTenantThunk .pending, (s) => {
        s.loading = true; s.error = null;
        toast.dismiss(); toast.loading('Registering...');
      })
      .addCase(registerTenantThunk .fulfilled, (s, a: PayloadAction<User>) => {
        s.loading = false; s.user = a.payload; s.success = true;
        toast.dismiss(); toast.success('Registered successfully ✅');
      })
      .addCase(registerTenantThunk .rejected, (s, a) => {
        s.loading = false; s.error = a.payload as string;
        toast.dismiss(); toast.error(a.payload as string || 'Registration failed ❌');
      })

      // 🧠 Current User
      .addCase(fetchCurrentUser.pending, (s) => {
        s.loading = true; s.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (s, a: PayloadAction<User>) => {
        s.user = a.payload; s.success = true; s.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (s) => {
        s.user = null; s.success = false; s.loading = false;
      })

      // 🚪 Logout
      .addCase(logoutUser.pending, (s) => {
        s.loading = true; s.error = null;
      })
      .addCase(logoutUser.fulfilled, (s) => {
        s.user = null; s.success = false; s.loading = false;
      })
      .addCase(logoutUser.rejected, (s) => {
        s.user = null; s.success = false; s.loading = false;
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
