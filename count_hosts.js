const http = require('http');

function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve([]);
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    // Query with same limit as frontend
    const data = await httpGet('http://localhost:3002/api/analytics/hosts/top?limit=500');
    if (Array.isArray(data)) {
        console.log(`Top Hosts Count: ${data.length}`);
    } else {
        console.log("Error: Response is not an array");
    }
}

run();
