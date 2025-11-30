'use client';

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import customerReducer from './slices/customerSlice';
import rentalCompanyReducer from './slices/rentalCompanySlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    customer: customerReducer,
    rentalCompany: rentalCompanyReducer,
    // add other slices here
  },
});

// Types for dispatch & selector
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
