"use client"
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { useEffect } from "react";
import { fetchCurrentUser } from "./store/slices/authSlice";

export default function GlobalAuthInitializer() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((s) => s.auth);
  const pathname = usePathname();


  useEffect(() => {

    if (pathname === "/login" || pathname === "/register") return ;

    if (!user && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch,pathname,user,loading]); // avoid infinite loops

  return null; // this component doesn’t render anything visually
}
