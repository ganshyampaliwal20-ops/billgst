import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
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
    secret: process.env.NEXTAUTH_SECRET,
    debug: true, // Enable NextAuth debugging
    callbacks: {
        async jwt({ token, user }) {
            console.log('Auth Debug [JWT]: Processing token', { tokenExists: !!token, userExists: !!user });
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            console.log('Auth Debug [Session]: constructing session', { tokenExists: !!token });
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    },
};

// Debug check for environment variables
if (!process.env.NEXTAUTH_SECRET) {
    console.warn('⚠️ WARNING: NEXTAUTH_SECRET is not set! Authentication will likely fail in production.');
}
if (!process.env.NEXTAUTH_URL) {
    console.warn('⚠️ WARNING: NEXTAUTH_URL is not set! This might cause redirect issues.');
}
