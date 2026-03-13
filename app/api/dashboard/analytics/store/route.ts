import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    let client;
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        client = await pool.connect();

        // Fetch counts
        const viewsRes = await client.query('SELECT COUNT(*) FROM store_views WHERE business_id = $1', [userId]);
        const clicksRes = await client.query('SELECT COUNT(*) FROM store_clicks WHERE business_id = $1', [userId]);
        const enquiriesRes = await client.query('SELECT COUNT(*) FROM store_enquiries WHERE business_id = $1', [userId]);

        // Get recent enquiries
        const recentEnquiriesRes = await client.query(
            'SELECT customer_name as name, customer_phone as phone, message as msg, created_at FROM store_enquiries WHERE business_id = $1 ORDER BY created_at DESC LIMIT 5',
            [userId]
        );

        client.release();

        return NextResponse.json({
            views: parseInt(viewsRes.rows[0].count),
            clicks: parseInt(clicksRes.rows[0].count),
            enquiries: parseInt(enquiriesRes.rows[0].count),
            recentEnquiries: recentEnquiriesRes.rows.map(e => ({
                ...e,
                time: timeAgo(new Date(e.created_at)),
                color: getRandomColor()
            }))
        });

    } catch (error) {
        console.error('Store Analytics Dashboard API Error:', error);
        if (client) client.release();
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function timeAgo(date: Date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
}

function getRandomColor() {
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#0ea5e9', '#ef4444', '#7c3aed'];
    return colors[Math.floor(Math.random() * colors.length)];
}
