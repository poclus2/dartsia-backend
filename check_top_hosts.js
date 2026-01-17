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
                    console.log("Raw:", data);
                    resolve({});
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    console.log("Fetching TOP HOSTS from Analytics...");
    const data = await httpGet('http://localhost:3002/api/analytics/hosts/top?limit=5');

    if (Array.isArray(data) && data.length > 0) {
        console.log(`Found ${data.length} hosts.`);
        const first = data[0];
        console.log("\n=== First Host Sample ===");
        console.log("Keys:", Object.keys(first));
        console.log("Score:", first.score);
        console.log("NetAddress:", first.netAddress);
        console.log("Settings:", JSON.stringify(first.settings, null, 2));

        if (first.settings) {
            console.log("\n--- Checking Critical Fields ---");
            console.log("storageprice:", first.settings.storageprice);
            console.log("totalstorage:", first.settings.totalstorage);
            console.log("remainingstorage:", first.settings.remainingstorage);
        }
    } else {
        console.log("No hosts returned or invalid format.", data);
    }
}

run();
