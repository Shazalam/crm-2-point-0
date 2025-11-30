// hooks/useBookingData.ts
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { 
  deleteNote, 
  updateNote, 
  addNote, 
  fetchBookingById, 
  clearBooking 
} from '@/app/store/slices/bookingSlice';
import { clearCustomer, fetchCustomerById } from '@/app/store/slices/customerSlice';
import { fetchCurrentUser } from '@/app/store/slices/authSlice';
import { useToastHandler } from '@/lib/utils/hooks/useToastHandler';
import { Note } from '@/lib/types/booking';

export const useBookingData = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { handleSuccessToast, handleErrorToast } = useToastHandler();
  
  const { user } = useAppSelector((state) => state.auth);
  const { currentBooking: booking, loading, error, actionLoading } = useAppSelector((state) => state.booking);
  const { customer, loading: customerLoading, error: customerError } = useAppSelector((state) => state.customer);

  const [agent, setAgent] = useState(user);

  // Fetch current user
  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser())
        .unwrap()
        .then(setAgent)
        .catch((error) => {
          console.error("Failed to fetch user:", error);
          handleErrorToast("Failed to load user information");
        });
    } else {
      setAgent(user);
    }
  }, [dispatch, user, handleErrorToast]);

  // Fetch booking data
  useEffect(() => {
    if (!id || booking?._id) return;

    const loadBooking = async () => {
      try {
        await dispatch(fetchBookingById(id as string)).unwrap();
      } catch (error) {
        handleErrorToast(
          error instanceof Error ? error.message : "Failed to load booking details"
        );
      }
    };
    
    loadBooking();
  }, [id, booking?._id, dispatch, handleErrorToast]);

  // Fetch customer data when files tab is active
  useEffect(() => {
    if (!id || customer?._id) return;

    const loadCustomer = async () => {
      try {
        await dispatch(fetchCustomerById(id as string)).unwrap();
      } catch (error) {
        handleErrorToast(
          error instanceof Error ? error.message : "Failed to load customer details"
        );
      }
    };

    loadCustomer();
  }, [id, customer?._id, dispatch, handleErrorToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearBooking());
      dispatch(clearCustomer());
    };
  }, [dispatch]);

  // Note management
  const [noteState, setNoteState] = useState({
    newNote: "",
    editingNoteId: null as string | null,
    editingNoteText: "",
    selectedNote: null as Note | null,
  });

  const handleAddNote = useCallback(() => {
    if (!noteState.newNote.trim()) return;
    dispatch(addNote({ bookingId: id as string, text: noteState.newNote.trim() }))
      .unwrap()
      .then(() => {
        handleSuccessToast("Note added successfully!");
        setNoteState(prev => ({ ...prev, newNote: "" }));
      })
      .catch((err) => handleErrorToast(err));
  }, [dispatch, id, noteState.newNote, handleSuccessToast, handleErrorToast]);

  const handleUpdateNote = useCallback(() => {
    if (!noteState.editingNoteId || !noteState.editingNoteText.trim()) return;
    dispatch(updateNote({
      bookingId: id as string,
      noteId: noteState.editingNoteId,
      text: noteState.editingNoteText.trim()
    }))
      .unwrap()
      .then(() => {
        handleSuccessToast("Note updated successfully!");
        setNoteState(prev => ({ ...prev, editingNoteId: null, editingNoteText: "" }));
      })
      .catch((err) => handleErrorToast(err));
  }, [dispatch, id, noteState.editingNoteId, noteState.editingNoteText, handleSuccessToast, handleErrorToast]);

  const handleDeleteNote = useCallback(() => {
    if (!noteState.selectedNote) return;
    dispatch(deleteNote({
      bookingId: id as string,
      noteId: noteState.selectedNote._id
    }))
      .unwrap()
      .then(() => {
        handleSuccessToast("Note deleted successfully!");
        setNoteState(prev => ({ ...prev, selectedNote: null }));
      })
      .catch((err) => handleErrorToast(err));
  }, [dispatch, id, noteState.selectedNote, handleSuccessToast, handleErrorToast]);

  return {
    id,
    booking,
    loading,
    error,
    actionLoading,
    customer,
    customerLoading,
    customerError,
    agent,
    noteState,
    setNoteState,
    handleAddNote,
    handleUpdateNote,
    handleDeleteNote,
  };
};