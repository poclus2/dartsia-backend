const https = require('https');

function fetch(url, port = 3002) {
    return new Promise((resolve, reject) => {
        const opts = {
            hostname: 'localhost',
            port: port,
            path: url,
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            timeout: 5000
        };

        const req = https.request(opts, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.log("Raw response:", data);
                    resolve({});
                }
            });
        });

        req.on('error', (err) => {
            // Try HTTP instead
            const http = require('http');
            const httpReq = http.request({ ...opts, protocol: 'http:' }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        console.log("Raw response:", data);
                        resolve({});
                    }
                });
            });
            httpReq.on('error', reject);
            httpReq.end();
        });

        req.end();
    });
}

async function run() {
    try {
        console.log("=== Testing /analytics/network endpoint ===\n");

        const stats = await fetch('/analytics/network');
        console.log("Network Stats Response:");
        console.log(JSON.stringify(stats, null, 2));

        console.log("\n=== Testing /analytics/network/history endpoint ===\n");

        const history = await fetch('/analytics/network/history?period=24h');
        console.log("Network History Response (metrics count):", history?.metrics?.length || 0);

        if (history?.metrics && history.metrics.length > 0) {
            const lastMetric = history.metrics[history.metrics.length - 1];
            console.log("\nLast metric entry:");
            console.log(JSON.stringify(lastMetric, null, 2));

            console.log("\nAll storagePrice values:");
            history.metrics.forEach((m, i) => {
                console.log(`  [${i}] storagePrice: ${m.storagePrice} (type: ${typeof m.storagePrice})`);
            });
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
