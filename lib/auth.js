import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

// FALLBACK SECRET FOR DEBUGGING
// This ensures that even if .env.local is missing, the app uses a consistent secret.
const DEBUG_SECRET = "temp_debug_secret_12345_should_be_in_env";

export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET || "fallback_dev_secret",
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log('Auth Debug [Authorize]: Attempting login for', credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const result = await pool.query(
                        'SELECT * FROM users WHERE email = $1',
                        [credentials.email]
                    );

                    const user = result.rows[0];

                    if (!user) {
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET || DEBUG_SECRET,
    debug: true, // Enable NextAuth debugging
    callbacks: {
        async jwt({ token, user, account }) {
            console.log('Auth Debug [JWT]: Processing token', {
                tokenExists: !!token,
                userExists: !!user,
                secretLen: (process.env.NEXTAUTH_SECRET || DEBUG_SECRET).length
            });
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            console.log('Auth Debug [Session]: constructing session', {
                tokenExists: !!token,
                tokenId: token?.id,
                sessionUser: !!session?.user
            });
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    },
};

// Safe detection for development vs production
const isDev = process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
    (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.includes('localhost'));

// Environment Variable Check - Only warn once per server start, and mostly in production
if (typeof window === 'undefined') {
    if (!process.env.NEXTAUTH_SECRET && !isDev) {
        console.warn('⚠️ [Auth]: NEXTAUTH_SECRET is missing. Production security is compromised.');
    }
    if (!process.env.NEXTAUTH_URL && !isDev) {
        console.warn('⚠️ [Auth]: NEXTAUTH_URL is missing. Redirects might fail in production.');
    }
}
