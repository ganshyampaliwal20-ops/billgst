import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * BillGST AI WhatsApp Bot Agent
 * This endpoint simulates a WhatsApp Webhook response
 */
export async function POST(request: Request) {
    try {
        const { from, message, businessId } = await request.json();
        const msg = message.toLowerCase();

        let client = await pool.connect();

        // 1. Fetch Business Context
        const business = await client.query(
            "SELECT business_name, business_upi_id FROM users WHERE id = $1",
            [businessId]
        );

        if (business.rows.length === 0) {
            client.release();
            return NextResponse.json({ reply: "Store not found." });
        }

        const bName = business.rows[0].business_name;
        let reply = "";

        // 2. Identify Customer by Phone (if exists)
        const customer = await client.query(
            "SELECT id, name FROM customers WHERE user_id = $1 AND phone ILIKE $2",
            [businessId, `%${from}%`]
        );

        if (customer.rows.length > 0) {
            const custId = customer.rows[0].id;
            const custName = customer.rows[0].name;

            // 3. Smart Intent Detection
            if (msg.includes('invoice') || msg.includes('bill') || msg.includes('paisa')) {
                // Fetch last few invoices
                const invoices = await client.query(
                    "SELECT invoice_number, total_amount, payment_status, created_at FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 1",
                    [custId]
                );

                if (invoices.rows.length > 0) {
                    const lastInv = invoices.rows[0];
                    reply = `Namaste ${custName}! Aapka last invoice *#${lastInv.invoice_number}* tha for *₹${lastInv.total_amount}*.\n\nStatus: *${lastInv.payment_status}*\n\nKya main aapko iska PDF link bhej doon?`;
                } else {
                    reply = `Namaste ${custName}! Aapka koi pending invoice nahi mila hai. Kuch aur pucha chahte hain?`;
                }
            } else if (msg.includes('pay') || msg.includes('payment') || msg.includes('qr')) {
                const upi = business.rows[0].business_upi_id;
                reply = `Haan ji! Aap is UPI ID par payment kar sakte hain: *${upi}*\n\nPayment karne ke baad screenshot bhej dijiye, main system mein update kar dunga. ✅`;
            } else if (msg.includes('hi') || msg.includes('hello') || msg.includes('start')) {
                reply = `Hi! I am *${bName} Smart AI Assistant*. \n\nAap mujhse pucch sakte hain:\n1. "My last bill?"\n2. "Payment options?"\n3. "Store timings?"`;
            } else {
                reply = `Ji, main samajh nahi paya. Kya aap bill ya payment ke baare mein jaanna chahte hain? Main *${bName}* ki taraf से aapki madad kar raha hoon.`;
            }
        } else {
            reply = `Namaste! Main *${bName}* ka AI Assistant hoon. Lagta hai aapka number hamare system mein save nahi hai. Kya main aapki koi madad kar sakta hoon?`;
        }

        client.release();
        return NextResponse.json({ reply });

    } catch (error) {
        console.error('WhatsApp Bot Error:', error);
        return NextResponse.json({ reply: "Ji, thodi takniki dikkat hai. Kripya bad mein koshish karein." }, { status: 500 });
    }
}
