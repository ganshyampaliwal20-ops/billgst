
import NextAuth, { DefaultSession, AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool from "./db";

// Extending NextAuth types to include 'id' and 'role'
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"]
    }

    interface User {
        id: string;
        role: string;
    }
}

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log('Auth Attempt:', credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log('Auth Error: Missing email or password');
                    return null;
                }

                const loginId = credentials.email.trim();
                const password = credentials.password.trim();

                try {
                    console.log('Querying Database for user:', loginId);
                    const result = await pool.query(
                        'SELECT * FROM users WHERE email = $1 OR phone = $1 OR name = $1',
                        [loginId]
                    );

                    const user = result.rows[0];

                    if (!user) {
                        console.log('Auth Error: User not found in DB');
                        return null;
                    }

                    console.log('User found, comparing password...');
                    const isPasswordValid = await bcrypt.compare(
                        password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        console.log('Password mismatch, checking bypass...');
                        // Emergency bypass for admin
                        if (loginId === 'gpaliwal59@gmail.com' && (password === 'admin123' || password === '123456')) {
                            console.log('Admin Bypass Successful');
                        } else {
                            console.log('Auth Error: Password incorrect');
                            return null;
                        }
                    }

                    console.log('Auth Success for:', user.email);
                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role
                    };
                } catch (error) {
                    console.error('Auth Error Exception:', error);
                    return null;
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt"
    }
};
