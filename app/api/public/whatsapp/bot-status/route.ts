import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * User-Specific API to fetch WhatsApp Status
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userEmail = session.user.email;
        const root = process.cwd();
        const qrFilePath = path.join(root, 'tmp', 'whatsapp-qr.txt');
        const statusFilePath = path.join(root, 'tmp', 'whatsapp-status.json');

        let status = 'INITIALIZING';
        let qr = null;
        let owner = null;

        // Check if status file exists
        if (fs.existsSync(statusFilePath)) {
            try {
                const statusData = JSON.parse(fs.readFileSync(statusFilePath, 'utf8'));
                status = statusData.status || status;
                owner = statusData.owner || null;
            } catch (e) { }
        }

        // If service is connected but to DIFFERENT user, show NOT_LINKED for this user
        // (This allows multiple users to see the service as available for them to scan)
        const isActuallyConnectedForThisUser = (status === 'CONNECTED' && owner === userEmail);

        // Check for QR file
        if (fs.existsSync(qrFilePath)) {
            qr = fs.readFileSync(qrFilePath, 'utf8');
        }

        return NextResponse.json({
            success: true,
            status: isActuallyConnectedForThisUser ? 'CONNECTED' : (status === 'CONNECTED' ? 'NOT_LINKED' : status),
            qr,
            owner,
            connected: isActuallyConnectedForThisUser,
            isOtherUserConnected: status === 'CONNECTED' && owner !== userEmail
        });

    } catch (error) {
        console.error('Error fetching WhatsApp Status:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
