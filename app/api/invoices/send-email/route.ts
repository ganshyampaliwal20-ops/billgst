import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import nodemailer from 'nodemailer';

// POST - Send invoice via email
export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { invoice_id, recipient_email, message } = body;

        if (!invoice_id || !recipient_email) {
            return NextResponse.json({ error: 'Invoice ID and recipient email required' }, { status: 400 });
        }

        // Get invoice details
        const invoiceResult = await pool.query(
            `SELECT i.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
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

        // Create email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        // Generate HTML email
        const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product_name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${Number(item.unit_price).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${Number(item.total_amount).toFixed(2)}</td>
      </tr>
    `).join('');

        const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #eee; }
          .invoice-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #dee2e6; }
          .total { background: #667eea; color: white; padding: 15px; text-align: right; font-size: 18px; font-weight: bold; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invoice</h1>
            <p style="margin: 0; opacity: 0.9;">${invoice.invoice_number}</p>
          </div>
          
          <div class="content">
            <p>Dear ${invoice.customer_name},</p>
            <p>${message || 'Please find your invoice details below.'}</p>

            <div class="invoice-details">
              <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
              <p><strong>Date:</strong> ${new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</p>
              ${invoice.due_date ? `<p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString('en-IN')}</p>` : ''}
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Rate</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="total">
              Total Amount: ₹${Number(invoice.total_amount).toLocaleString('en-IN')}
            </div>

            ${invoice.notes ? `<p style="margin-top: 20px;"><strong>Notes:</strong><br>${invoice.notes}</p>` : ''}
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        // Send email
        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to: recipient_email,
            subject: `Invoice ${invoice.invoice_number}`,
            html: emailHtml
        });

        return NextResponse.json({
            success: true,
            message: 'Invoice sent successfully via email'
        });
    } catch (error: any) {
        console.error('Send Email Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
    }
}
