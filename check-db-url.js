
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key === 'DATABASE_URL') {
            console.log('DATABASE_URL found.');
            const url = value.trim();
            // Mask password
            const masked = url.replace(/:([^:@]+)@/, ':****@');
            console.log('Value:', masked);
        }
    });
} else {
    console.log('.env.local not found');
}
