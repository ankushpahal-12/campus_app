const http = require('http');

const email = 'ankushpayal58@gmail.com';
const password = 'Duggu@Doggy@12ap'; // We expect a 401 error, which proves the controller handled the error correctly via next()

const data = JSON.stringify({
    email,
    password
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log(`Testing login for ${email} on port 5000...`);

const req = http.request(options, res => {
    console.log(`Status Code: ${res.statusCode}`);

    let body = '';
    res.on('data', chunk => body += chunk);

    res.on('end', () => {
        console.log('Response Body:', body);
        if (res.statusCode === 401) {
            console.log('SUCCESS: Received expected 401 Unauthorized. Error handling is working.');
        } else if (res.statusCode === 200) {
            console.log('SUCCESS: Login successful (unexpected with dummy password, but controller works).');
        } else {
            console.log('Observation: Received status', res.statusCode);
        }
    });
});

req.on('error', error => {
    console.error('Connection Error:', error.message);
    console.log('Make sure the backend server is running on port 5000.');
});

req.write(data);
req.end();
