/**
 * whatsapp-bot.js
 * 
 * Standalone WhatsApp Bot Server using @whiskeysockets/baileys
 * This connects to your PostgreSQL DB, polls for 'STARTING_SERVICE'
 * and initiates a WhatsApp connection, writing the QR code back to the database.
 * 
 * Instructions:
 * 1. \`npm install @whiskeysockets/baileys pino qrcode pg\`
 * 2. Set \`DATABASE_URL\` env variable.
 * 3. Run \`node whatsapp-bot.js\` (Host this on Railway/Render for 24/7 background worker)
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const activeSessions = new Map();

async function startUserSession(userId) {
    if (activeSessions.has(userId)) return;
    activeSessions.set(userId, true);

    console.log(`Starting session for user: ${userId}`);
    await pool.query("UPDATE whatsapp_bot_status SET status = 'STARTING', last_updated = CURRENT_TIMESTAMP WHERE user_id = $1", [userId]);

    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${userId}`);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log(`Generating QR for ${userId}`);
            const qrBase64 = await QRCode.toDataURL(qr);
            await pool.query(
                "UPDATE whatsapp_bot_status SET status = 'STARTING', qr_code = $1, last_updated = CURRENT_TIMESTAMP WHERE user_id = $2",
                [qrBase64, userId]
            );
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                activeSessions.delete(userId);
                startUserSession(userId);
            } else {
                console.log(`User ${userId} logged out`);
                await pool.query("UPDATE whatsapp_bot_status SET status = 'DISCONNECTED', qr_code = NULL WHERE user_id = $1", [userId]);
                activeSessions.delete(userId);
            }
        } else if (connection === 'open') {
            console.log(`Connected successfully for ${userId}`);
            await pool.query("UPDATE whatsapp_bot_status SET status = 'CONNECTED', qr_code = NULL WHERE user_id = $1", [userId]);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Queue processing logic goes here...
}

async function pollForNewStarts() {
    try {
        const { rows } = await pool.query("SELECT user_id FROM whatsapp_bot_status WHERE status = 'STARTING_SERVICE'");
        for (const row of rows) {
            startUserSession(row.user_id);
        }
    } catch (e) {
        console.error('Polling error:', e.message);
    }
}

// Start polling every 5 seconds
console.log('WhatsApp Background Bot Engine Started...');
setInterval(pollForNewStarts, 5000);
