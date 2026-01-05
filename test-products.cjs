
const http = require('http');

const data = JSON.stringify({
    name: 'Debug Product ' + Date.now(),
    price: 100,
    description: 'Test Desc',
    stock_quantity: 50
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/products',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Sending Product (No ID)...');
const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => console.log('Response:', body));
});

req.on('error', error => {
    console.error('Request Error:', error);
});

req.write(data);
req.end();
