import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface CustomerLocation {
  country: string;
  region: string;
  city: string;
  zipcode: string;
}

export interface Customer {
  _id: string;
  ip: string;
  sessionId: string;
  device: string;
  browser: string;
  os: string;
  bookingId: string;
  location: CustomerLocation;
  acknowledged: boolean;
  frontImage: string;
  backImage: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CustomerResponse {
  ok: boolean;
  customer: Customer;
}

interface CustomerState {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customer: null,
  loading: false,
  error: null,
};

// Async thunk to fetch customer data
export const fetchCustomerById = createAsyncThunk<
  Customer,            // return type
  string,              // argument type
  { rejectValue: string } // type of rejectWithValue
>(
  'customer/fetchCustomerById',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://www.nationfirstchoice.com/api/customers/${customerId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch customer: ${response.statusText}`);
      }

      const data: CustomerResponse = await response.json();

      if (!data.ok) {
        throw new Error('API returned error status');
      }

      return data.customer;
    } catch (error: unknown) {
      // Properly type error
      let message = 'Failed to fetch customer data';
      if (error instanceof Error) message = error.message;
      return rejectWithValue(message);
    }
  }
);

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearCustomer: (state) => {
      state.customer = null;
      state.error = null;
    },
    resetCustomerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.loading = false;
        state.customer = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch customer';
        state.customer = null;
      });
  },
});

export const { clearCustomer, resetCustomerError } = customerSlice.actions;
export default customerSlice.reducer;
