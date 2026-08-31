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
            return NextResponse.json({ error: 'Unauthorized', debug: !cronSecret ? 'No secret env found' : 'Mismatch' }, { status: 401 });
        }

        const now = new Date();
        const currentHour = now.getHours();

        client = await pool.connect();

        // 1. Find all users who have auto-reminders enabled
        const usersResult = await client.query(`
            SELECT id, business_name, business_upi_id, auto_reminders_enabled, 
                   reminder_frequency, reminder_time, whatsapp_sender_number, whatsapp_api_key, language
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

            const isTest = searchParams.get('test') === 'true';
            
            const dateCondition = isTest 
                ? "" // In test mode, include today's invoices
                : `AND i.invoice_date <= CURRENT_DATE - (INTERVAL '1 day' * $2)`;

            const queryArgs: any[] = [user.id];
            if (!isTest) {
                queryArgs.push(parseInt(frequency as any) || 3);
            }

            const invoicesResult = await client.query(`
                SELECT i.id, i.invoice_number, i.total_amount, i.paid_amount, i.invoice_date,
                       c.name as customer_name, c.phone as customer_phone
                FROM invoices i
                JOIN customers c ON i.customer_id = c.id
                WHERE i.created_by = $1 
                AND i.status IN ('UNPAID', 'PARTIAL', 'Pending')
                ${dateCondition}
                ORDER BY i.invoice_date ASC
            `, queryArgs);

            const userLang = user.language || 'en';

            for (const inv of invoicesResult.rows) {
                const pendingAmount = parseFloat(inv.total_amount) - parseFloat(inv.paid_amount);
                const formattedAmount = pendingAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                
                // Using hardcoded templates here to avoid module import issues in Edge/Serverless functions sometimes
                const templates: Record<string, string> = {
                    en: 'Dear {customer_name},\nYour payment of *₹{amount}* is pending with *{business_name}*.\n\nIf you have already made the payment, kindly ignore this message.\n\nThank You,\n{business_name}',
                    hi: 'प्रिय {customer_name},\nआपका *₹{amount}* का पेमेंट *{business_name}* के पास बकाया (pending) है।\n\nयदि आपने पेमेंट कर दिया है, तो कृपया इस संदेश को अनदेखा करें।\n\nधन्यवाद,\n{business_name}',
                    gu: 'પ્રિય {customer_name},\nતમારું *₹{amount}* નું પેમેન્ટ *{business_name}* પાસે બાકી (pending) છે.\n\nજો તમે પેમેન્ટ કરી દીધું હોય, તો કૃપા કરીને આ મેસેજને અવગણો.\n\nઆભાર,\n{business_name}',
                    mr: 'प्रिय {customer_name},\nतुमचे *₹{amount}* चे पेमेंट *{business_name}* कडे थकीत (pending) आहे.\n\nजर तुम्ही पेमेंट केले असेल, तर कृपया या संदेशाकडे दुर्लक्ष करा.\n\nधन्यवाद,\n{business_name}',
                    ta: 'அன்புள்ள {customer_name},\nஉங்கள் *₹{amount}* கட்டணம் *{business_name}* இடம் நிலுவையில் (pending) உள்ளது.\n\nநீங்கள் ஏற்கனவே கட்டணம் செலுத்தியிருந்தால், இந்த செய்தியை தவிர்க்கவும்.\n\nநன்றி,\n{business_name}',
                    te: 'ప్రియమైన {customer_name},\nమీ *₹{amount}* చెల్లింపు *{business_name}* వద్ద పెండింగ్‌లో ఉంది.\n\nమీరు ఇప్పటికే చెల్లింపు చేసి ఉంటే, దయచేసి ఈ సందేశాన్ని విస్మరించండి.\n\nధన్యవాదాలు,\n{business_name}',
                    bn: 'প্রিয় {customer_name},\nআপনার *₹{amount}* এর পেমেন্ট *{business_name}* এর কাছে বকেয়া (pending) আছে।\n\nযদি আপনি ইতিমধ্যেই পেমেন্ট করে থাকেন, তবে অনুগ্রহ করে এই মেসেজটি এড়িয়ে যান।\n\nধন্যবাদ,\n{business_name}',
                    kn: 'ಆತ್ಮೀಯ {customer_name},\nನಿಮ್ಮ *₹{amount}* ಪಾವತಿಯು *{business_name}* ಬಳಿ ಬಾಕಿ (pending) ಇದೆ.\n\nನೀವು ಈಗಾಗಲೇ ಪಾವತಿ ಮಾಡಿದ್ದರೆ, ದಯವಿಟ್ಟು ಈ ಸಂದೇಶವನ್ನು ನಿರ್ಲಕ್ಷಿಸಿ.\n\nಧನ್ಯವಾದಗಳು,\n{business_name}',
                    ml: 'പ്രിയ {customer_name},\nനിങ്ങളുടെ *₹{amount}* പേയ്‌മെന്റ് *{business_name}* ൽ ബാക്കിയുണ്ട് (pending).\n\nനിങ്ങൾ ഇതിനകം പേയ്‌മെന്റ് നൽകിയിട്ടുണ്ടെങ്കിൽ, ദയവായി ഈ സന്ദേശം അവഗണിക്കുക.\n\nനന്ദി,\n{business_name}'
                };
                
                let rawMsg = templates[userLang] || templates['en'];
                let message = rawMsg
                    .replace('{customer_name}', inv.customer_name)
                    .replace('{amount}', formattedAmount)
                    .replace('{business_name}', user.business_name || 'Business')
                    .replace('{business_name}', user.business_name || 'Business');

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
                        let cleanPhone = inv.customer_phone.replace(/\D/g, '');
                        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
                        const chatId = `${cleanPhone}@c.us`;

                        const hostPrefix = instanceId.substring(0, 4);
                        const apiUrl = `https://${hostPrefix}.api.greenapi.com/waInstance${instanceId}/sendMessage/${token}`;
                        
                        const res = await fetch(apiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chatId: chatId,
                                message: message
                            })
                        });
                        const resData = await res.json();
                        console.log(`WhatsApp Status: ${res.ok ? 'SENT' : 'FAILED'} to ${inv.customer_phone}`);
                    } catch (e) {
                        console.error('Failed to auto-send via Green API:', e);
                    }
                } else {
                    // 4. Fallback to Multi-User Bot (whatsapp-service.js via DB Queue)
                    try {
                        await client.query(
                            `INSERT INTO whatsapp_bot_queue (user_id, phone, message) VALUES ($1, $2, $3)`,
                            [user.id, inv.customer_phone, message]
                        );
                        console.log(`WhatsApp Status: QUEUED to DB for ${inv.customer_phone}`);
                    } catch (e) {
                        console.error('Failed to queue to local bot DB:', e);
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
