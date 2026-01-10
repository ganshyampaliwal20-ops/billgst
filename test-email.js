
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

console.log('Testing Email Configuration...');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);
// Do not log the password fully for security, just length
console.log('Pass Length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendTestEmail() {
    try {
        console.log('Attempting to verify transporter connection...');
        await transporter.verify();
        console.log('✅ Transporter verification successful.');

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL,
            to: process.env.SMTP_USER, // Send to self
            subject: "Test Email from Debug Script",
            text: "If you receive this, email sending is working.",
            html: "<b>If you receive this, email sending is working.</b>",
        });

        console.log('✅ Message sent: %s', info.messageId);
    } catch (error) {
        console.error('❌ Error occurred:', error);
    }
}

sendTestEmail();
