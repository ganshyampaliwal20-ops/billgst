import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET || "temp_debug_secret_12345_should_be_in_env",
    });

    const isAuth = !!token;
    const { pathname } = req.nextUrl;

    // 0. SKIP API ROUTES (Safety check)
    if (pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // 1. Redirect to dashboard if logged in and trying to access public auth paths or root
    if (isAuth && (pathname === "/login" || pathname === "/register" || pathname === "/")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. Protect dashboard routes
    if (pathname.startsWith("/dashboard")) {
        if (!isAuth) {
            let from = pathname;
            if (req.nextUrl.search) {
                from += req.nextUrl.search;
            }
            return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/login",
        "/register",
        "/dashboard/:path*"
    ],
};
