import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();
const TMP = path.join(ROOT, 'tmp');
const AUTH_ROOT = path.join(ROOT, '.wwebjs_auth');
const REQUEST_DIR = path.join(TMP, 'requests');

// Map to store active clients: userId -> client
const activeClients = new Map();

console.log('--- MULTI-USER WHATSAPP SERVICE STARTING ---');

// Ensure directories exist
[TMP, AUTH_ROOT, REQUEST_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Initialize a WhatsApp client for a specific user
 */
async function createClient(userId, userEmail) {
    if (activeClients.has(userId)) {
        console.log(`[${userId}] Client already active.`);
        return activeClients.get(userId);
    }

    console.log(`[${userId}] Initializing client for ${userEmail}...`);

    const userTmp = path.join(TMP, `user-${userId}`);
    if (!fs.existsSync(userTmp)) fs.mkdirSync(userTmp, { recursive: true });

    const QR_FILE = path.join(userTmp, 'qr.txt');
    const STATUS_FILE = path.join(userTmp, 'status.json');

    const updateStatus = (status, extra = {}) => {
        fs.writeFileSync(STATUS_FILE, JSON.stringify({
            status,
            userId,
            userEmail,
            lastUpdate: Date.now(),
            ...extra
        }));
    };

    updateStatus('STARTING');

    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: `user-${userId}`,
            dataPath: AUTH_ROOT
        }),
        puppeteer: {
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        }
    });

    client.on('qr', (qr) => {
        console.log(`[${userId}] NEW QR RECEIVED`);
        // qrcode.generate(qr, { small: true }); // Removed terminal QR for multi-user clarity
        fs.writeFileSync(QR_FILE, qr);
        updateStatus('QR_READY', { qr });
    });

    client.on('ready', () => {
        console.log(`[${userId}] ✅ READY! Connected as: ${userEmail}`);
        if (fs.existsSync(QR_FILE)) fs.unlinkSync(QR_FILE);
        updateStatus('CONNECTED', { owner: userEmail });
    });

    client.on('auth_failure', (msg) => {
        console.error(`[${userId}] AUTH FAILURE:`, msg);
        updateStatus('AUTH_FAILED', { message: msg });
    });

    client.on('disconnected', (reason) => {
        console.log(`[${userId}] DISCONNECTED:`, reason);
        updateStatus('DISCONNECTED');
        activeClients.delete(userId);
    });

    client.on('message', async (msg) => {
        const content = msg.body.toLowerCase();
        if (content.includes('billgst') || content.includes('hi') || content.includes('hello')) {
            msg.reply(`Namaste! I am the AI assistant for ${userEmail}. How can I help you today? (Multi-User Bot Active ✅)`);
        }
    });

    try {
        await client.initialize();
        activeClients.set(userId, client);
    } catch (e) {
        console.error(`[${userId}] Failed to initialize:`, e.message);
        updateStatus('ERROR', { error: e.message });
    }

    return client;
}

/**
 * Periodically check for new "Start Requests"
 */
async function pollRequests() {
    try {
        const files = fs.readdirSync(REQUEST_DIR);
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(REQUEST_DIR, file);
                try {
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    await createClient(data.userId, data.userEmail);
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error('Error processing request file:', file, err.message);
                }
            }
        }
    } catch (e) { }
}

/**
 * Startup: Resume all existing sessions
 */
async function resumeSessions() {
    console.log('--- RESUMING EXISTING SESSIONS ---');
    if (!fs.existsSync(AUTH_ROOT)) return;

    const folders = fs.readdirSync(AUTH_ROOT);
    for (const folder of folders) {
        if (folder.startsWith('session-user-')) {
            const userId = folder.replace('session-user-', '');
            // We don't have the userEmail easily here, 
            // but for resumes we can just use the session ID
            await createClient(userId, `Restored Session (${userId})`);
        }
    }
}

console.log('--- SYSTEM READY: Watching for user link requests ---');
resumeSessions().then(() => {
    setInterval(pollRequests, 3000); // Check every 3 seconds
});
