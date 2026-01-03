
const fetch = require('node-fetch'); // Next.js env might not have this in standalone script, but let's try native fetch if node 18+
// Actually, node 18+ has native fetch.

async function testApi() {
    try {
        console.log('Testing sending data to API...');
        const res = await fetch('http://localhost:3000/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 'test-' + Date.now(),
                name: 'API Test User',
                phone: '9998887776',
                email: 'test@api.com'
            })
        });

        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response:', text);
    } catch (e) {
        console.error('Fetch Failed:', e);
    }
}

testApi();
