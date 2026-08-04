import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '../public/shop-photos');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

const photoUrls = {
    // Smiling retail shop owner at checkout counter
    'shopkeeper.jpg': 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&auto=format&fit=crop&q=85',
    'shopkeeper_male.jpg': 'https://images.unsplash.com/photo-1556741533-411cf82e4e2d?w=800&auto=format&fit=crop&q=85',
    // Indian Kirana / Grocery Store
    'kirana_store.jpg': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop&q=85',
    // Hardware & Tools Store
    'hardware_store.jpg': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=85',
    // Retail shop checkout billing
    'billing_counter.jpg': 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&auto=format&fit=crop&q=85'
};

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                return downloadImage(response.headers.location, dest).then(resolve).catch(reject);
            }
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to download '${url}', status: ${response.statusCode}`));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Saved: ${dest}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function main() {
    console.log('Downloading shopkeeper photos...');
    for (const [filename, url] of Object.entries(photoUrls)) {
        const dest = path.join(imagesDir, filename);
        try {
            await downloadImage(url, dest);
        } catch (e) {
            console.error(`Error downloading ${filename}:`, e.message);
        }
    }
    console.log('Done downloading!');
}

main();
