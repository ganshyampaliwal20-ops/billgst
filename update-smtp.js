
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env.local');

try {
    let content = fs.readFileSync(envPath, 'utf8');

    // Remove existing SMTP_PASS line
    content = content.replace(/^SMTP_PASS=.*$/gm, '');

    // Append new correct password (removing spaces for safety)
    const newPass = "exvxxeiuncwglqfj";
    content += `\nSMTP_PASS="${newPass}"`;

    // Clean up empty lines
    content = content.replace(/\n\s*\n/g, '\n');

    fs.writeFileSync(envPath, content, 'utf8');
    console.log('✅ Updated SMTP_PASS in .env.local');
} catch (err) {
    console.error('❌ Failed to update .env.local:', err);
}
