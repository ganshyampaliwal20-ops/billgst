
const http = require('http');

const data = JSON.stringify({
    id: 'test-uuid-' + Date.now(),
    name: 'Debug User 2',
    phone: '9999999999'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/customers',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Sending request...');
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
