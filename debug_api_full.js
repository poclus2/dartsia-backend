
const https = require('https');

function fetch(url) {
    return new Promise((resolve, reject) => {
        const opts = {
            headers: {
                'User-Agent': 'PostmanRuntime/7.32.0', // Mimic Postman
                'Accept': '*/*'
            },
            family: 4,
            timeout: 10000
        };

        const req = https.get(url, opts, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log("Status:", res.statusCode);
                try {
                    const json = JSON.parse(data);
                    console.log("Full JSON Keys:", Object.keys(json));
                    console.log("totalStorage type:", typeof json.totalStorage);
                    console.log("remainingStorage type:", typeof json.remainingStorage);
                    console.log("totalStorage:", json.totalStorage);
                    console.log("remainingStorage:", json.remainingStorage);
                    // Dump slice of body if needed
                } catch (e) {
                    console.log("Raw Data (first 500 chars):", data.substring(0, 500));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

run();

async function run() {
    await fetch('https://explorer.siagraph.info/api/metrics/host');
}
