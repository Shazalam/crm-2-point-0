// bookingSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Booking {
  _id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  rentalCompany: string;
  confirmationNumber: string;
  vehicleImage?: string;
  total?: string;
  mco?: string;
  refundAmount?: string,
  payableAtPickup?: string;
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  cardLast4: string;
  expiration: string;
  billingAddress: string;
  salesAgent: string;
  dateOfBirth?: string;
   agentId?: string;
  status: "BOOKED" | "MODIFIED" | "CANCELLED" | "ALL";
  createdAt: string;
  modificationFee: { charge: string }[]; // Change to array
  timeline?: {
    date: string;
    message: string;
    agentName: string;
    changes: { text: string }[];
  }[];
  // Add notes field
  notes: {
    _id: string;
    text: string;
    agentName: string;
    createdAt: string;
    createdBy?: string;
  }[];

  changes: { text: string }[]
}

interface BookingState {
  currentBooking: Booking | null;
  bookingsList: Booking[];
  loading: boolean;
  listLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  operation: "idle" | "pending" | "succeeded" | "failed";
}

const initialState: BookingState = {
  currentBooking: null,
  bookingsList: [],
  loading: false,
  listLoading: false,
  actionLoading: false,
  error: null,
  operation: "idle",
};

// Async thunks for fetch booking list
export const fetchBookings = createAsyncThunk<
  Booking[],
  void,
  { rejectValue: string }
>("booking/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/bookings", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch bookings");
    }

    const data = await res.json();
    console.log("fetchBooking =>", data)
    return data.bookings || [];
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error loading bookings";
    return rejectWithValue(message);
  }
});

// Async thunk for saving/updating booking
export const saveBooking = createAsyncThunk<
  Booking,
  { formData: Partial<Booking>; id?: string },
  { rejectValue: string }
>("booking/save", async ({ formData, id }, { rejectWithValue }) => {
  try {
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/bookings/${id}` : "/api/bookings";

    // For updates, remove _id from the data
    const dataToSend = id ?
      Object.fromEntries(Object.entries(formData).filter(([key]) => key !== '_id')) :
      formData;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to save booking");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error saving booking";
    return rejectWithValue(message);
  }
});

// Async thunk for fetching booking by ID
export const fetchBookingById = createAsyncThunk<
  Booking,
  string,
  { rejectValue: string }
>("booking/fetchById", async (id, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/bookings/${id}`, { credentials: "include" });

    if (!res.ok) {
      throw new Error("Failed to load booking");
    }

    const data = await res.json();
    return data.booking as Booking;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error loading booking";
    return rejectWithValue(message);
  }
});


// --- Note-related thunks ---
export const addNote = createAsyncThunk<
  Booking,
  { bookingId: string; text: string },
  { rejectValue: string }
>("booking/addNote", async ({ bookingId, text }, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/bookings/${bookingId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to add note");
    }

    const data = await res.json();
    return data.booking as Booking;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Error adding note");
  }
});

export const updateNote = createAsyncThunk<
  Booking,
  { bookingId: string; noteId: string; text: string },
  { rejectValue: string }
>("booking/updateNote", async ({ bookingId, noteId, text }, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/bookings/${bookingId}/notes/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update note");
    }

    const data = await res.json();
    return data.booking as Booking;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Error updating note");
  }
});

export const deleteNote = createAsyncThunk<
  Booking,
  { bookingId: string; noteId: string },
  { rejectValue: string }
>("booking/deleteNote", async ({ bookingId, noteId }, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/bookings/${bookingId}/notes/${noteId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to delete note");
    }

    const data = await res.json();
    return data.booking as Booking;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Error deleting note");
  }
});

// --- DELETE BOOKING (Soft Delete) ---
export const deleteBooking = createAsyncThunk<
  string, // Return deleted booking ID
  string, // bookingId
  { rejectValue: string }
>("booking/delete", async (bookingId, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to delete booking");
    }

    return bookingId; // return the deleted booking ID
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error deleting booking";
    return rejectWithValue(message);
  }
});


const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBooking: (state) => {
      state.currentBooking = null;
      state.error = null;
      state.loading = false;
      state.operation = "idle";
    },
    clearBookingsList: (state) => {
      state.bookingsList = [];
    },
    resetOperationStatus: (state) => {
      state.operation = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all bookings
      .addCase(fetchBookings.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.bookingsList = action.payload;
        state.listLoading = false;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch bookings";
        state.listLoading = false;
      })
      // Save booking cases
      .addCase(saveBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operation = "pending";
      })
      .addCase(saveBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.currentBooking = action.payload;
        state.loading = false;
        state.operation = "succeeded";
      })
      .addCase(saveBooking.rejected, (state, action) => {
        state.error = action.payload || "Failed to save booking";
        state.loading = false;
        state.operation = "failed";
      })
      // Fetch booking cases
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.currentBooking = action.payload;
        state.loading = false;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch booking";
        state.loading = false;
      })
      // -------------------- ADD NOTE --------------------
      .addCase(addNote.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.operation = "pending";
      })
      .addCase(addNote.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.currentBooking = action.payload;
        state.actionLoading = false;
        state.operation = "succeeded";
      })
      .addCase(addNote.rejected, (state, action) => {
        state.error = action.payload || "Failed to add note";
        state.actionLoading = false;
        state.operation = "failed";
      })

      // -------------------- UPDATE NOTE --------------------
      .addCase(updateNote.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.operation = "pending";
      })
      .addCase(updateNote.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.currentBooking = action.payload;
        state.actionLoading = false;
        state.operation = "succeeded";
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.error = action.payload || "Failed to update note";
        state.actionLoading = false;
        state.operation = "failed";
      })

      // -------------------- DELETE NOTE --------------------
      .addCase(deleteNote.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.operation = "pending";
      })
      .addCase(deleteNote.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.currentBooking = action.payload;
        state.actionLoading = false;
        state.operation = "succeeded";
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete note";
        state.actionLoading = false;
        state.operation = "failed";
      })
      // -------------------- DELETE BOOKING --------------------
      .addCase(deleteBooking.pending, (state) => {
        state.listLoading= true;
        state.error = null;
        state.operation = "pending";
      })
      .addCase(deleteBooking.fulfilled, (state, action: PayloadAction<string>) => {
        state.bookingsList = state.bookingsList.filter(
          (b) => b._id !== action.payload
        );
        state.listLoading = false;
        state.operation = "succeeded";
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete booking";
        state.listLoading = false;
        state.operation = "failed";
      });
  },
});

export const { clearBooking, resetOperationStatus } = bookingSlice.actions;
export default bookingSlice.reducer;