import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const isAdmin = session.user.email === 'billgstapp@gmail.com' || session.user.email === 'ganshyampaliwal20@gmail.com';
        const client = await pool.connect();

        try {
            if (isAdmin) {
                // Admin gets all distinct users or just all chats ordered by latest
                const { searchParams } = new URL(request.url);
                const fetchUser = searchParams.get('user_email');

                if (fetchUser) {
                    // Admin fetching specific user chat
                    const result = await client.query(`
                        SELECT id, user_email, message, is_admin, created_at, attachment_url, attachment_type 
                        FROM support_chats 
                        WHERE user_email = $1 
                        ORDER BY created_at ASC
                    `, [fetchUser]);
                    client.release();
                    return NextResponse.json(result.rows);
                } else {
                    // Admin fetching inbox list (latest message per user)
                    const result = await client.query(`
                        SELECT user_email, message, created_at, is_admin, attachment_url, attachment_type 
                        FROM support_chats s1
                        WHERE created_at = (
                            SELECT MAX(created_at) FROM support_chats s2 WHERE s1.user_email = s2.user_email
                        )
                        ORDER BY created_at DESC
                    `);
                    client.release();
                    return NextResponse.json(result.rows);
                }
            } else {
                // Normal user fetching their own chat
                const result = await client.query(`
                    SELECT id, user_email, message, is_admin, created_at, attachment_url, attachment_type 
                    FROM support_chats 
                    WHERE user_email = $1 
                    ORDER BY created_at ASC
                `, [session.user.email]);
                client.release();
                return NextResponse.json(result.rows);
            }
        } catch (dbError) {
            client.release();
            throw dbError;
        }
    } catch (error) {
        console.error('Error fetching support chats:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const isAdmin = session.user.email === 'billgstapp@gmail.com' || session.user.email === 'ganshyampaliwal20@gmail.com';
        const data = await request.json();

        // If admin is replying, they must send target_user_email. Else target is self.
        const targetEmail = isAdmin && data.target_user_email ? data.target_user_email : session.user.email;
        const message = data.message || '';
        const attachment_url = data.attachment_url || null;
        const attachment_type = data.attachment_type || null;

        if (!message && !attachment_url) {
            return NextResponse.json({ error: 'Message or attachment is required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            const result = await client.query(`
                INSERT INTO support_chats (user_email, message, is_admin, attachment_url, attachment_type)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [targetEmail, message, isAdmin, attachment_url, attachment_type]);
            client.release();
            return NextResponse.json(result.rows[0]);
        } catch (dbError) {
            client.release();
            throw dbError;
        }
    } catch (error) {
        console.error('Error saving support chat:', error);
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}
