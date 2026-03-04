import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const QR_FILE = path.join(ROOT, 'tmp', 'whatsapp-qr.txt');
const STATUS_FILE = path.join(ROOT, 'tmp', 'whatsapp-status.json');

// Ensure tmp exists
if (!fs.existsSync(path.join(ROOT, 'tmp'))) {
    fs.mkdirSync(path.join(ROOT, 'tmp'));
}

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: path.join(ROOT, '.wwebjs_auth')
    }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    }
});

client.on('qr', (qr) => {
    console.log('--- SCAN QR CODE WITH WHATSAPP ---');
    qrcode.generate(qr, { small: true });
    fs.writeFileSync(QR_FILE, qr);
    fs.writeFileSync(STATUS_FILE, JSON.stringify({ status: 'QR_READY', lastUpdate: Date.now() }));
    console.log('\nQR Code saved to tmp/whatsapp-qr.txt for Dashboard Settings.');
});

client.on('ready', () => {
    console.log('✅ BillGST WhatsApp AI Bot is READY!');
    fs.unlinkSync(QR_FILE); // Remove QR as it's no longer needed
    fs.writeFileSync(STATUS_FILE, JSON.stringify({ status: 'CONNECTED', lastUpdate: Date.now() }));
});

client.on('authenticated', () => {
    console.log('Authenticated! Generating Session...');
});

client.on('auth_failure', (msg) => {
    console.error('AUTHENTICATION FAILURE', msg);
    fs.writeFileSync(STATUS_FILE, JSON.stringify({ status: 'AUTH_FAILED', lastUpdate: Date.now() }));
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    fs.writeFileSync(STATUS_FILE, JSON.stringify({ status: 'DISCONNECTED', lastUpdate: Date.now() }));
});

// Incoming Message Handler (AI Logic)
client.on('message', async (msg) => {
    const from = msg.from;
    const content = msg.body.toLowerCase();

    // We already have the logic in app/api/public/whatsapp/webhook/route.ts
    // For now, let's keep a simple reply or we could call our own local API
    // (In production, usually you'd trigger a webhook here)
    if (content.includes('billgst') || content.includes('hi') || content.includes('hello')) {
        msg.reply("Namaste! BillGST AI Assistant is connecting your message... (Live AI Active ✅)");
    }
});

console.log('Starting WhatsApp AI Bot Support Service...');
client.initialize();
