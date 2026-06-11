import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();
const TMP = path.join(ROOT, 'tmp');
const AUTH_ROOT = path.join(ROOT, '.wwebjs_auth');

dotenv.config({ path: path.join(ROOT, '.env.local') });

// Setup PostgreSQL pool
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Map to store active clients: userId -> client
const activeClients = new Map();

console.log('--- MULTI-USER WHATSAPP SERVICE STARTING (DB IPC) ---');

// Ensure directories exist
[TMP, AUTH_ROOT].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Initialize a WhatsApp client for a specific user
 */
async function createClient(userId, userEmail) {
    if (activeClients.has(userId)) {
        return activeClients.get(userId);
    }

    console.log(`[${userId}] Initializing client for ${userEmail}...`);

    const updateStatus = async (status, qrCode = null) => {
        try {
            await pool.query(
                `INSERT INTO whatsapp_bot_status (user_id, status, qr_code, last_updated) 
                 VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                 ON CONFLICT (user_id) DO UPDATE 
                 SET status = EXCLUDED.status, qr_code = EXCLUDED.qr_code, last_updated = CURRENT_TIMESTAMP`,
                [userId, status, qrCode]
            );
        } catch (err) {
            console.error(`[${userId}] Failed to update DB status:`, err.message);
        }
    };

    await updateStatus('STARTING_SERVICE');

    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: `user-${userId}`,
            dataPath: AUTH_ROOT
        }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
                '--disable-blink-features=AutomationControlled'
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null
        }
    });

    client.on('qr', (qr) => {
        console.log(`[${userId}] NEW QR RECEIVED`);
        updateStatus('STARTING', qr);
    });

    client.on('ready', () => {
        console.log(`[${userId}] ✅ READY! Connected`);
        updateStatus('READY');
    });

    client.on('auth_failure', (msg) => {
        console.error(`[${userId}] AUTH FAILURE:`, msg);
        updateStatus('ERROR');
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
        updateStatus('ERROR');
    }

    return client;
}

/**
 * Periodically check for new "Start Requests" from the Database
 */
async function pollRequests() {
    try {
        const result = await pool.query(`SELECT user_id, status FROM whatsapp_bot_status WHERE status = 'STARTING_SERVICE' OR status = 'STARTING'`);
        for (const row of result.rows) {
            // Only create if we haven't already started initializing it in memory
            if (!activeClients.has(row.user_id)) {
                // Fetch email from users table
                const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [row.user_id]);
                const email = userRes.rows.length > 0 ? userRes.rows[0].email : 'Unknown';
                await createClient(row.user_id, email);
            }
        }
    } catch (e) {
        console.error('Error polling requests:', e.message);
    }
}

/**
 * Periodically check for new "Media/Message Requests" from the Database Queue
 */
async function pollMediaRequests() {
    try {
        const result = await pool.query(`SELECT id, user_id, phone, message FROM whatsapp_bot_queue WHERE status = 'PENDING' LIMIT 20`);
        
        for (const row of result.rows) {
            const { id, user_id, phone, message } = row;
            
            const client = activeClients.get(user_id);
            if (client) {
                try {
                    const chatId = `${phone.replace(/\D/g, '')}@c.us`.replace(/^0+/, ''); // Clean phone
                    const jid = chatId.length === 10 ? `91${chatId}@c.us` : chatId;

                    console.log(`[${user_id}] Sending DB queued message to ${jid}...`);
                    await client.sendMessage(jid, message);
                    
                    // Mark as sent
                    await pool.query(`UPDATE whatsapp_bot_queue SET status = 'SENT' WHERE id = $1`, [id]);
                } catch (sendErr) {
                    console.error(`[${user_id}] Failed to send DB queued message:`, sendErr.message);
                    await pool.query(`UPDATE whatsapp_bot_queue SET status = 'FAILED' WHERE id = $1`, [id]);
                }
            }
        }
    } catch (e) {
        console.error('Error polling media requests:', e.message);
    }
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
            await createClient(userId, `Restored Session (${userId})`);
        }
    }
}

console.log('--- SYSTEM READY: Watching for DB requests ---');
resumeSessions().then(() => {
    setInterval(pollRequests, 5000);
    setInterval(pollMediaRequests, 3000);
    
    // Automatic Payment Reminders Cron Logic
    let lastCronHour = -1;
    setInterval(async () => {
        const currentHour = new Date().getHours();
        if (currentHour !== lastCronHour) {
            lastCronHour = currentHour;
            console.log(`[CRON] Triggering hourly reminder check for hour ${currentHour}...`);
            try {
                let cronSecret = process.env.NEXTAUTH_SECRET || process.env.WHATSAPP_CRON_SECRET || 'billgst_test_123';
                const res = await fetch(`https://www.billgst.in/api/public/whatsapp/reminders?secret=${cronSecret}`);
                const data = await res.json();
                console.log(`[CRON] Reminder trigger result:`, data);
            } catch (err) {
                console.error(`[CRON] Failed to trigger reminders:`, err.message);
            }
        }
    }, 60000); // Check every minute
});
