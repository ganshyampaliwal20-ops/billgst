import { spawn } from 'child_process';

console.log('--- STARTING ALL SERVICES (WEB + WHATSAPP) ---');

// 1. Start WhatsApp Service
const whatsapp = spawn('node', ['scripts/whatsapp-service.js'], {
    stdio: 'inherit',
    shell: true,
    env: process.env
});

whatsapp.on('error', (err) => {
    console.error('Failed to start WhatsApp service:', err);
});

// 2. Start Next.js App
const web = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    env: process.env
});

web.on('error', (err) => {
    console.error('Failed to start Web service:', err);
});

// Handle termination
process.on('SIGINT', () => {
    whatsapp.kill();
    web.kill();
    process.exit();
});
