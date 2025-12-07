import fs from 'fs';
import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('hex');
const envContent = `\nNEXTAUTH_SECRET="${secret}"
NEXTAUTH_URL="http://localhost:3000"`;

fs.appendFileSync('.env.local', envContent);
console.log('Added NEXTAUTH_SECRET and NEXTAUTH_URL to .env.local');
