
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
                let activeId = token.id as string;
                let activeRole = token.role as string;
                
                try {
                    const { cookies } = require('next/headers');
                    const cookieStore = await cookies();
                    const wsId = cookieStore.get('billgst_workspace_id')?.value;
                    const wsRole = cookieStore.get('billgst_workspace_role')?.value;
                    if (wsId) activeId = wsId;
                    if (wsRole) activeRole = wsRole;
                } catch (e) {
                    // Ignore errors if cookies() is not available in this context
                }

                session.user.role = activeRole;
                session.user.id = activeId;
                // Add personal ID to session so frontend knows who they really are
                (session.user as any).personalId = token.id as string;
                (session.user as any).personalRole = token.role as string;
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
