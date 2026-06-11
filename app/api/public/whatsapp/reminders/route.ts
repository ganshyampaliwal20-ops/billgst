import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    let client;
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        // Security check - validate secret
        const cronSecret = process.env.WHATSAPP_CRON_SECRET || process.env.NEXTAUTH_SECRET;
        if (!secret || secret !== cronSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const currentHour = now.getHours();

        client = await pool.connect();

        // 1. Find all users who have auto-reminders enabled
        const usersResult = await client.query(`
            SELECT id, business_name, business_upi_id, auto_reminders_enabled, 
                   reminder_frequency, reminder_time, whatsapp_sender_number, whatsapp_api_key
            FROM users 
            WHERE auto_reminders_enabled = true
        `);

        const reminders = [];

        for (const user of usersResult.rows) {
            // Check if current hour matches user's reminder time
            const [remHour] = (user.reminder_time || "10:00").split(':').map(Number);

            // For testing/manual trigger via secret, we skip hour check if needed
            // Otherwise, we only process at the right hour
            if (currentHour !== remHour && !searchParams.get('force')) {
                continue;
            }

            const frequency = user.reminder_frequency || 3;

            const invoicesResult = await client.query(`
                SELECT i.id, i.invoice_number, i.total_amount, i.paid_amount, i.invoice_date,
                       c.name as customer_name, c.phone as customer_phone
                FROM invoices i
                JOIN customers c ON i.customer_id = c.id
                WHERE i.created_by = $1 
                AND i.status IN ('UNPAID', 'PARTIAL', 'Pending')
                AND i.invoice_date <= CURRENT_DATE - (INTERVAL '1 day' * $2)
                ORDER BY i.invoice_date ASC
            `, [user.id, parseInt(frequency as any) || 3]);

            for (const inv of invoicesResult.rows) {
                const pendingAmount = parseFloat(inv.total_amount) - parseFloat(inv.paid_amount);
                const message = `Namaste ${inv.customer_name} ji, this is an automatic reminder for your pending balance of ₹${pendingAmount.toLocaleString('en-IN')} for Invoice #${inv.invoice_number} from ${user.business_name}. Please ignore if already paid.`;

                const reminderData = {
                    business_id: user.id,
                    business_name: user.business_name,
                    customer_name: inv.customer_name,
                    phone: inv.customer_phone,
                    invoice_number: inv.invoice_number,
                    pending_amount: pendingAmount,
                    message: message,
                    sender_number: user.whatsapp_sender_number,
                    api_key: user.whatsapp_api_key
                };

                // 2. Determine Gateway (User's private gateway OR System Central Gateway)
                let instanceId = '';
                let token = '';

                if (user.whatsapp_api_key && user.whatsapp_api_key.includes(':')) {
                    // Use User's own Gateway
                    [instanceId, token] = user.whatsapp_api_key.split(':').map((s: string) => s.trim());
                } else if (process.env.WHATSAPP_INSTANCE_ID && process.env.WHATSAPP_TOKEN) {
                    // Use System Fallback Gateway (for automatic sending if user hasn't setup)
                    instanceId = process.env.WHATSAPP_INSTANCE_ID;
                    token = process.env.WHATSAPP_TOKEN;
                }

                // 3. Send if gateway found
                if (instanceId && token) {
                    try {
                        const res = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: new URLSearchParams({
                                token: token,
                                to: inv.customer_phone.startsWith('91') ? inv.customer_phone.trim() : `91${inv.customer_phone.trim()}`,
                                body: message
                            })
                        });
                        const resData = await res.json();
                        console.log(`WhatsApp Status: ${resData.sent === 'true' ? 'SENT' : 'FAILED'} to ${inv.customer_phone}`);
                    } catch (e) {
                        console.error('Failed to auto-send via UltraMsg:', e);
                    }
                } else {
                    // 4. Fallback to Multi-User Bot (whatsapp-service.js)
                    try {
                        const fs = require('fs');
                        const path = require('path');
                        const crypto = require('crypto');
                        const MEDIA_DIR = path.join(process.cwd(), 'tmp', 'media-requests');
                        if (!fs.existsSync(MEDIA_DIR)) {
                            fs.mkdirSync(MEDIA_DIR, { recursive: true });
                        }
                        
                        const reqData = {
                            userId: user.id.toString(),
                            phone: inv.customer_phone,
                            message: message,
                            timestamp: Date.now()
                        };
                        const fileName = `rem_${user.id}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.json`;
                        fs.writeFileSync(path.join(MEDIA_DIR, fileName), JSON.stringify(reqData));
                        console.log(`WhatsApp Status: QUEUED to Local Bot for ${inv.customer_phone}`);
                    } catch (e) {
                        console.error('Failed to queue to local bot:', e);
                    }
                }

                reminders.push(reminderData);
            }
        }

        client.release();
        return NextResponse.json({
            success: true,
            count: reminders.length,
            processed_at: now.toISOString(),
            reminders
        });

    } catch (error: any) {
        if (client) client.release();
        console.error('Reminders Logic Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
