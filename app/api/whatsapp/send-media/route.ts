import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const phone = formData.get('phone') as string;
        const message = formData.get('message') as string;

        if (!phone) {
            return NextResponse.json({ error: 'Missing phone number' }, { status: 400 });
        }

        const ROOT = process.cwd();
        const TMP = path.join(ROOT, 'tmp');
        const MEDIA_DIR = path.join(TMP, 'media-requests');
        const UPLOADS_DIR = path.join(TMP, 'uploads');

        // Ensure directories exist
        [TMP, MEDIA_DIR, UPLOADS_DIR].forEach(dir => {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        let filePath = null;
        let filename = null;

        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            filename = `${uuidv4()}-${file.name}`;
            filePath = path.join(UPLOADS_DIR, filename);
            fs.writeFileSync(filePath, buffer);
        }

        // Create the request
        const requestId = uuidv4();
        const requestData = {
            userId: session.user.id,
            phone,
            message: message || '',
            mediaPath: filePath,
            filename: file ? file.name : null,
            timestamp: Date.now()
        };

        fs.writeFileSync(
            path.join(MEDIA_DIR, `${requestId}.json`),
            JSON.stringify(requestData)
        );

        return NextResponse.json({ success: true, message: 'Media request queued' });
    } catch (error) {
        console.error('Send Media Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
