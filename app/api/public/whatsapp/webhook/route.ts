import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * BillGST Ultra-Smart AI WhatsApp Agent
 * Authenticated via Bot Token from Settings
 */
export async function POST(request: Request) {
    try {
        const { from, message, businessId, token } = await request.json();
        const msg = message.toLowerCase();

        // 1. Security Check: Validate Bot Token
        const cronSecret = process.env.WHATSAPP_CRON_SECRET || process.env.NEXTAUTH_SECRET;
        if (!token || token !== cronSecret) {
            return NextResponse.json({ error: "Unauthorized: Invalid Bot Token" }, { status: 401 });
        }

        const client = await pool.connect();

        // 2. Fetch Business Context
        const business = await client.query(
            "SELECT business_name, business_upi_id, business_email, business_phone, business_address FROM users WHERE id = $1",
            [businessId]
        );

        if (business.rows.length === 0) {
            client.release();
            return NextResponse.json({ reply: "Store not found." });
        }

        const bData = business.rows[0];
        const bName = bData.business_name;
        let reply = "";

        // 3. Identify Activity & Customer context
        const customer = await client.query(
            "SELECT id, name FROM customers WHERE user_id = $1 AND phone ILIKE $2",
            [businessId, `%${from}%`]
        );

        const isCustomer = customer.rows.length > 0;
        const custName = isCustomer ? customer.rows[0].name : "Dost";

        // 4. Advanced Brain Logic (ChatGPT Style - Handling everything related to BillGST & Business)

        // --- Billing & Invoices ---
        if (msg.includes('invoice') || msg.includes('bill') || msg.includes('hisab') || msg.includes('paisa')) {
            if (isCustomer) {
                const invoices = await client.query(
                    "SELECT invoice_number, total_amount, payment_status FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 1",
                    [customer.rows[0].id]
                );
                if (invoices.rows.length > 0) {
                    const lastInv = invoices.rows[0];
                    reply = `Namaste ${custName}! Aapka last bill *#${lastInv.invoice_number}* total *₹${lastInv.total_amount}* ka hai. Status: *${lastInv.payment_status}*. Main aapko iski PDF link bhej sakta hoon, bas 'PDF' likh kar bhejein.`;
                } else {
                    reply = `Haan ji ${custName}, aapka koi purana bill system mein nahi mila. Kya main aapke liye naya bill generate karoon?`;
                }
            } else {
                reply = `Namaste! Main *${bName}* ka AI hoon. Bills ki jankari ke liye mujhe aapka registered number chahiye hoga. Kya main aapki koi aur madad karoon?`;
            }
        }
        // --- Payment & QR ---
        else if (msg.includes('pay') || msg.includes('payment') || msg.includes('qr') || msg.includes('upi')) {
            reply = `Zaroor! Aap *${bName}* ko is UPI ID par pay kar sakte hain: *${bData.business_upi_id}*. \n\nPayment karne ke baad yahan screenshot bhej dein, hum turant receipt update kar denge. ✅`;
        }
        // --- About the Shop/Business ---
        else if (msg.includes('kahan') || msg.includes('address') || msg.includes('location') || msg.includes('shop')) {
            reply = `Humari shop *${bName}* yahan sthit hai: \n📍 ${bData.business_address || 'Address not set'}. \n\nAap kabhi bhi aa sakte hain!`;
        }
        else if (msg.includes('contact') || msg.includes('phone') || msg.includes('email') || msg.includes('number')) {
            reply = `Aap humein yahan contact kar sakte hain:\n📞 Phone: ${bData.business_phone}\n📧 Email: ${bData.business_email}`;
        }
        // --- General Website & Software Help (LLM Style) ---
        else if (msg.includes('software') || msg.includes('website') || msg.includes('billgst') || msg.includes('kya hai')) {
            reply = `BillGST ek advanced Cloud-based Billing software hai. Isse aap:\n1. 5 seconds mein Fast Invoicing kar sakte hain.\n2. Inventory track kar sakte hain.\n3. Digital Storefront bana sakte hain.\n4. WhatsApp Reminders bhej sakte hain.\n\nKya aapko inmein se kisi feature ke baare mein janna hai?`;
        }
        else if (msg.includes('gst') || msg.includes('tax')) {
            reply = `GST ek indirect tax hai. BillGST par aap GSTR-1, 3B aur GSTR-4 reports 1-click mein generate kar sakte hain. Aapka data hamesha encrypted aur safe rehta hai.`;
        }
        // --- Greetings & General Chat ---
        else if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('namaste')) {
            reply = `Namaste ${custName}! 🙏 Main *${bName}* ka AI Assistant hoon. Main aapka bill check kar sakta hoon, payment QR bhej sakta hoon aur shop ki jankari de sakta hoon. \n\nBataiye, aaj main aapki kaise madad karoon?`;
        }
        else if (msg.includes('thanks') || msg.includes('shukriya') || msg.includes('dhanyawad')) {
            reply = `Aapka swagat hai! Humesha aapki seva mein hazir. Kuch aur? 😊`;
        }
        // --- AI Universal Response (Fallback) ---
        else {
            reply = `Ji, main samajh gaya. Aap *${bName}* ke baare mein kuch pucha rahe hain. \n\nMain aapki help kar sakta hoon:\n👉 Bill aur Balance nikalne mein\n👉 Payment QR dene mein\n👉 Shop ka address aur contact batane mein\n\nKya main inmein se kuch karoon?`;
        }

        client.release();
        return NextResponse.json({ reply });

    } catch (error) {
        console.error('WhatsApp Bot Error:', error);
        return NextResponse.json({ reply: "Maaf kijiye, main thoda confused hoon. Kya aap dobara bol sakte hain?" }, { status: 500 });
    }
}
