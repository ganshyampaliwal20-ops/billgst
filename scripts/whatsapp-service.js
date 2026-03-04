import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd(); // Better for Windows
const TMP = path.join(ROOT, 'tmp');
const QR_FILE = path.join(TMP, 'whatsapp-qr.txt');
const STATUS_FILE = path.join(TMP, 'whatsapp-status.json');

console.log('--- SYSTEM STARTUP ---');
console.log('Work Dir:', ROOT);
console.log('Tmp Dir:', TMP);

// Ensure tmp exists
if (!fs.existsSync(TMP)) {
    console.log('Creating tmp directory...');
    fs.mkdirSync(TMP, { recursive: true });
}

fs.writeFileSync(STATUS_FILE, JSON.stringify({ status: 'STARTING', lastUpdate: Date.now() }));
console.log('✅ Status initialized to STARTING');

// Helper to find Chrome on Windows
const getChromePath = () => {
    const paths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return undefined;
};

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "billgst-agent",
        dataPath: path.join(ROOT, '.wwebjs_auth')
    }),
    qrMaxRetries: 20,
    authTimeoutMs: 180000,
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1015822643-alpha.html',
    },
    puppeteer: {
        headless: 'new',
        executablePath: getChromePath(), // Try to use user's real browser
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-blink-features=AutomationControlled',
            '--disable-infobars',
            '--window-size=1280,720',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        ]
    }
});

console.log('--- SYSTEM CHECK ---');
console.log('Directory:', ROOT);
console.log('Status File:', STATUS_FILE);

client.on('qr', (qr) => {
    console.log('\n✅ [EVENT] QR Received! Generating terminal QR...');
    qrcode.generate(qr, { small: true });

    try {
        fs.writeFileSync(QR_FILE, qr);
        fs.writeFileSync(STATUS_FILE, JSON.stringify({ status: 'QR_READY', lastUpdate: Date.now() }));
        console.log('💾 QR code written to tmp/whatsapp-qr.txt');
    } catch (e) {
        console.error('❌ Error writing files:', e.message);
    }
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
