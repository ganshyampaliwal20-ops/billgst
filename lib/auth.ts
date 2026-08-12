
import NextAuth, { DefaultSession, AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
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
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
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
                        if (loginId === 'billgstapp@gmail.com' && (password === 'admin123' || password === '123456')) {
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
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                try {
                    const email = user.email;
                    const name = user.name || 'Google User';
                    
                    if (!email) return false;
                    
                    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
                    
                    if (existingUser.rows.length === 0) {
                        const userCountRes = await pool.query('SELECT COUNT(*) FROM users');
                        const userCount = parseInt(userCountRes.rows[0].count);
                        const planType = userCount < 100 ? 'LIFETIME' : 'FREE';
                        
                        const fakePassword = await bcrypt.hash(Math.random().toString(36), 10);
                        
                        const result = await pool.query(
                            'INSERT INTO users (name, email, password, role, plan_type, subscription_status, free_invoices_balance) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                            [name, email, fakePassword, 'USER', planType, 'ACTIVE', 0]
                        );
                        const newUserId = result.rows[0].id;
                        
                        const safeName = name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') || 'USR';
                        const newRefCode = safeName + Math.floor(1000 + Math.random() * 9000);
                        await pool.query('INSERT INTO referral_codes (user_id, code) VALUES ($1, $2)', [newUserId, newRefCode]);
                        
                        user.id = newUserId.toString();
                        (user as any).role = 'USER';
                    } else {
                        user.id = existingUser.rows[0].id.toString();
                    }
                } catch(e) {
                    console.error('Google Sign In Error:', e);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // Also ensure we get the right ID and role for Google users on first login
            if (account?.provider === 'google' && user?.email) {
                const dbUser = await pool.query('SELECT id, role FROM users WHERE email = $1', [user.email]);
                if (dbUser.rows.length > 0) {
                    token.id = dbUser.rows[0].id.toString();
                    token.role = dbUser.rows[0].role;
                }
            } else if (user) {
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
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days persistent login
        updateAge: 24 * 60 * 60,   // Update session every 24 hours
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60, // 30 days persistent cookie
            },
        },
    },
};
