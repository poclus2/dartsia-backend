const https = require('https');

function get(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`[${res.statusCode}] ${url}`);
                console.log("Body Start:", data.substring(0, 500));
                resolve();
            });
        }).on('error', (e) => {
            console.log(`Error: ${e.message}`);
            resolve();
        });
    });
}

async function run() {
    await get('https://api.sia.tech/hosts');
}

run();
