"use client"
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { useEffect } from "react";
import { fetchCurrentUserThunk } from "./store/slices/authSlice";

export default function GlobalAuthInitializer() {
  const dispatch = useAppDispatch();
  const { user, fetchUserLoading } = useAppSelector((s) => s.auth);
  const pathname = usePathname();


  useEffect(() => {

    if (pathname === "/login" || pathname === "/register") return ;

    if (!user && !fetchUserLoading) {
      dispatch(fetchCurrentUserThunk());
    }
  }, [dispatch,pathname,user,fetchUserLoading]); // avoid infinite loops

  return null; // this component doesn’t render anything visually
}
