
const https = require('https');

function fetch(url) {
    return new Promise((resolve, reject) => {
        const opts = {
            headers: { 'User-Agent': 'Sia-Agent' },
            family: 4, // Force IPv4
            timeout: 10000
        };

        const req = https.get(url, opts, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.log("Response not JSON:", data.substring(0, 100));
                    resolve({});
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function run() {
    try {
        console.log("Fetching /api/metrics/host...");
        const data = await fetch('https://explorer.siagraph.info/api/metrics/host');
        console.log("Keys:", Object.keys(data));
        console.log("activeHosts:", data.activeHosts);
        console.log("totalStorage:", data.totalStorage);
        console.log("remainingStorage:", data.remainingStorage);
    } catch (e) {
        console.error(e);
    }
}

run();
