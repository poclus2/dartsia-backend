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
    console.log("Checking Top Hosts freshness...");
    const data = await httpGet('http://localhost:3002/api/analytics/hosts/top?limit=100');

    if (!Array.isArray(data)) {
        console.log("Error: API returned non-array");
        return;
    }

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let oldHosts = 0;
    let activeHosts = 0;

    data.forEach(h => {
        const seen = new Date(h.lastSeen);
        if (seen < yesterday) {
            oldHosts++;
        } else {
            activeHosts++;
        }
    });

    console.log(`Total checked: ${data.length}`);
    console.log(`Active (last 24h): ${activeHosts}`);
    console.log(`Old/Inactive: ${oldHosts}`);

    if (data.length > 0) {
        console.log(`First host LastSeen: ${data[0].lastSeen}`);
    }
}

run();
