import { useCallback } from "react";
import { toast, ToastOptions } from "react-hot-toast";

export function useToastHandler() {

  const showLoadingToast = useCallback((message: string, id: string = "global-toast") => {
    return toast.loading(message, { id });
  }, [])

  const handleSuccessToast = useCallback((
    message: string,
    options?: string | ToastOptions
  ) => {
    if (typeof options === "string") {
      toast.success(message, { id: options });
    } else {
      toast.success(message, options);
    }
  }, [])

  const handleErrorToast = useCallback((message: string, options?: string | ToastOptions) => {
    if (typeof options === "string") {
      return toast.error(message, { id: options });
    } else {
      return toast.error(message, options);
    }
  }, [])

  const handleDismissToast = useCallback((id: string = "global-toast") => {
    toast.dismiss(id);
  }, [])

  return {
    showLoadingToast,
    handleSuccessToast,
    handleErrorToast,
    handleDismissToast
  };
}


