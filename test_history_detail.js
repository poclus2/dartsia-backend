const http = require('http');

function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: data });
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    console.log("Testing history endpoint in detail...\n");

    const res = await httpGet('http://localhost:3002/api/analytics/network/history?period=24h');
    console.log("Status:", res.status);
    console.log("Full Response:");
    console.log(JSON.stringify(res.data || res.raw, null, 2));
}

run();
