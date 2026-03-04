import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API to fetch the current WhatsApp QR code from the background service
 * For Settings Dashboard
 */
export async function GET() {
    try {
        const root = process.cwd();
        const qrFilePath = path.join(root, 'tmp', 'whatsapp-qr.txt');
        const statusFilePath = path.join(root, 'tmp', 'whatsapp-status.json');

        let status = 'INITIALIZING';
        let lastUpdate = Date.now();
        let qr = null;

        // Check if status file exists
        if (fs.existsSync(statusFilePath)) {
            try {
                const statusData = JSON.parse(fs.readFileSync(statusFilePath, 'utf8'));
                status = statusData.status || status;
                lastUpdate = statusData.lastUpdate || lastUpdate;
            } catch (e) { }
        }

        // Check for QR file
        if (fs.existsSync(qrFilePath)) {
            qr = fs.readFileSync(qrFilePath, 'utf8');
        }

        return NextResponse.json({
            success: true,
            status,
            qr,
            lastUpdate,
            requiresScan: status === 'QR_READY' && qr !== null,
            connected: status === 'CONNECTED'
        });

    } catch (error) {
        console.error('Error fetching WhatsApp Status:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch status' }, { status: 500 });
    }
}
