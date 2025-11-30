import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")

    const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")

    // If no token and trying to access protected page -> redirect to login
    if (!token && !isAuthRoute) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    // If already logged in and going to login/register -> redirect to dashboard
    if (token && isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Otherwise continue
    return NextResponse.next()
}

export const config = {
    matcher :  ["/dashboard","/bookings/:path*","/login","/register"]
}