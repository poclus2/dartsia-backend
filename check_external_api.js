const https = require('https');

function post(url, body) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(body))
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.log("Raw:", data.substring(0, 500));
                    resolve([]);
                }
            });
        });

        req.on('error', reject);
        req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    console.log("Querying https://api.sia.tech/api/hosts?limit=5...");
    const data = await post('https://api.sia.tech/api/hosts?limit=5&offset=0', {});

    if (Array.isArray(data) && data.length > 0) {
        console.log(`Received ${data.length} hosts.`);
        const first = data[0];
        console.log("First host settings keys:", Object.keys(first.settings || {}));

        const s = first.settings || {};
        console.log(`- storageprice: ${s.storageprice}`);
        console.log(`- totalstorage: ${s.totalstorage}`);
        console.log(`- remainingstorage: ${s.remainingstorage}`);
        console.log(`- netAddress: ${first.netAddress}`);
    } else {
        console.log("No data or error.", data);
    }
}

run();
