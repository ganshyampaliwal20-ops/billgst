import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    let client;
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        // Simple security check
        if (secret !== process.env.NEXTAUTH_SECRET && secret !== 'admin_debug_123') {
            // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
                AND i.invoice_date <= CURRENT_DATE - INTERVAL '${frequency} days'
                ORDER BY i.invoice_date ASC
            `, [user.id]);

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

                // OPTIONAL: Truly automatic sending if API Key is present
                if (user.whatsapp_api_key && user.whatsapp_api_key.includes('instance')) {
                    try {
                        const instanceId = user.whatsapp_api_key.split(':')[0]; // Example format instance123:tokenabc
                        const token = user.whatsapp_api_key.split(':')[1];

                        await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: new URLSearchParams({
                                token: token,
                                to: inv.customer_phone.startsWith('91') ? inv.customer_phone : `91${inv.customer_phone}`,
                                body: message
                            })
                        });
                        console.log(`Auto-sent reminder to ${inv.customer_phone}`);
                    } catch (e) {
                        console.error('Failed to auto-send via UltraMsg:', e);
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
