
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env.local');

try {
    // Try reading as utf16le which is common on Windows for "Unicode" text files
    const content = fs.readFileSync(envPath, 'utf16le');
    console.log('--- START OF FILE (UTF-16LE) ---');
    console.log(content);
    console.log('--- END OF FILE ---');
} catch (err) {
    console.error('Error reading file:', err);
}
