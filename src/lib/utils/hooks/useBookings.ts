// hooks/useBookings.ts
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { RootState } from '@/app/store/store';
import { fetchBookings } from '@/app/store/slices/bookingSlice';
import { useToastHandler } from '@/lib/utils/hooks/useToastHandler';

export const useBookings = () => {
  const dispatch = useAppDispatch();
  const { handleSuccessToast, handleErrorToast, showLoadingToast, handleDismissToast } = useToastHandler();
  
  const { bookingsList, listLoading, error } = useAppSelector(
    (state: RootState) => state.booking
  );

  const fetchBookingsHandler = useCallback(async (options?: {
    showLoading?: boolean;
    successMessage?: string;
  }) => {
    const { showLoading = true, successMessage } = options || {};
    
    let toastId: string | undefined;
    
    try {
      if (showLoading) {
        toastId = showLoadingToast("Loading bookings...");
      }

      const result = await dispatch(fetchBookings()).unwrap();
      
      if (showLoading) {
        if (successMessage) {
          handleSuccessToast(successMessage, toastId);
        } else {
          // Dismiss loading toast without showing success message
          handleDismissToast(toastId);
        }
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load bookings";
      
      if (showLoading) {
        handleErrorToast(errorMessage, toastId);
      }
      
      throw error;
    }
  }, [dispatch, showLoadingToast, handleSuccessToast, handleErrorToast, handleDismissToast]);

  const refetchBookings = useCallback(async () => {
    return fetchBookingsHandler({
      showLoading: false,
    });
  }, [fetchBookingsHandler]);

  return {
    bookings: bookingsList,
    loading: listLoading,
    error,
    fetchBookings: fetchBookingsHandler,
    refetchBookings,
  };
};