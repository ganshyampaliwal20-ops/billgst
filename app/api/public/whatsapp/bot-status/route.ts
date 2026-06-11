import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * User-Specific API to fetch WhatsApp Status
 */
export async function GET(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const userEmail = session.user.email;
        const root = process.cwd();

        const userTmpDir = path.join(root, 'tmp', `user-${userId}`);
        const statusFilePath = path.join(userTmpDir, 'status.json');
        const qrFilePath = path.join(userTmpDir, 'qr.txt');
        const requestDir = path.join(root, 'tmp', 'requests');

        // Ensure request dir exists
        if (!fs.existsSync(requestDir)) fs.mkdirSync(requestDir, { recursive: true });

        let status = 'INITIALIZING';
        let qr = null;
        let owner = null;

        // 1. Check if user already has a status file
        if (fs.existsSync(statusFilePath)) {
            try {
                const statusData = JSON.parse(fs.readFileSync(statusFilePath, 'utf8'));
                status = statusData.status || status;
                owner = statusData.owner || null;
            } catch (e) { }
        } else {
            // 2. No status file? Create a START REQUEST for the background service
            const requestFile = path.join(requestDir, `${userId}.json`);
            if (!fs.existsSync(requestFile)) {
                fs.writeFileSync(requestFile, JSON.stringify({ userId, userEmail }));
            }
            status = 'STARTING_SERVICE';
        }

        // 3. Check for QR file
        if (fs.existsSync(qrFilePath)) {
            qr = fs.readFileSync(qrFilePath, 'utf8');
        }

        return NextResponse.json({
            success: true,
            status,
            qr,
            connected: status === 'CONNECTED',
            userId
        });

    } catch (error: any) {
        console.error('Error fetching WhatsApp Status:', error);
        return NextResponse.json({ success: false, error: String(error) + (error.stack ? ' | ' + error.stack : '') }, { status: 500 });
    }
}
