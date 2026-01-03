import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';

// POST - Send invoice via WhatsApp
export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { invoice_id, phone_number } = body;

        if (!invoice_id || !phone_number) {
            return NextResponse.json({ error: 'Invoice ID and phone number required' }, { status: 400 });
        }

        // Get invoice details
        const invoiceResult = await pool.query(
            `SELECT i.*, c.name as customer_name, c.phone as customer_phone
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.id = $1`,
            [invoice_id]
        );

        if (invoiceResult.rows.length === 0) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        const invoice = invoiceResult.rows[0];

        // Get invoice items
        const itemsResult = await pool.query(
            'SELECT * FROM invoice_items WHERE invoice_id = $1',
            [invoice_id]
        );
        const items = itemsResult.rows;

        // Create WhatsApp message text
        let message = `*INVOICE*\n\n`;
        message += `📄 Invoice No: *${invoice.invoice_number}*\n`;
        message += `📅 Date: ${new Date(invoice.invoice_date).toLocaleDateString('en-IN')}\n`;
        if (invoice.due_date) {
            message += `⏰ Due Date: ${new Date(invoice.due_date).toLocaleDateString('en-IN')}\n`;
        }
        message += `\n👤 Customer: *${invoice.customer_name}*\n`;
        message += `\n━━━━━━━━━━━━━━━━\n`;
        message += `*ITEMS:*\n\n`;

        items.forEach((item, index) => {
            message += `${index + 1}. ${item.product_name}\n`;
            message += `   Qty: ${item.quantity} × ₹${Number(item.unit_price).toFixed(2)}\n`;
            message += `   Amount: ₹${Number(item.total_amount).toFixed(2)}\n\n`;
        });

        message += `━━━━━━━━━━━━━━━━\n`;
        message += `*TOTAL AMOUNT: ₹${Number(invoice.total_amount).toLocaleString('en-IN')}*\n`;

        if (invoice.notes) {
            message += `\n📝 Notes: ${invoice.notes}\n`;
        }

        message += `\n✨ Thank you for your business!\n`;
        message += `\nPowered by BillGST`;

        // Create WhatsApp URL with encoded message
        const whatsappUrl = `https://wa.me/${phone_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

        return NextResponse.json({
            success: true,
            whatsapp_url: whatsappUrl,
            message: 'WhatsApp link generated successfully'
        });
    } catch (error: any) {
        console.error('WhatsApp Share Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
