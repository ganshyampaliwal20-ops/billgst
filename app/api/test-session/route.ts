import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    return NextResponse.json({
        status: 'check',
        session_exists: !!session,
        user: session?.user || null,
        message: session ? "Session is working on server!" : "No session found (Unauthorized)",
        env_secret_set: !!process.env.NEXTAUTH_SECRET,
        cookies: request.headers.get('cookie') || 'none'
    });
}
