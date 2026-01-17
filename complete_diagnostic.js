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
                    resolve({ status: res.statusCode, data: data });
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    console.log("=== COMPLETE DIAGNOSTIC ===\n");

    // Test 1: Analytics Service Direct (port 3002)
    console.log("1. Testing Analytics Service Direct (http://localhost:3002/api/analytics/network/history?period=24h):");
    try {
        const res1 = await httpGet('http://localhost:3002/api/analytics/network/history?period=24h');
        console.log(`   Status: ${res1.status}`);
        if (res1.data.metrics) {
            console.log(`   Metrics count: ${res1.data.metrics.length}`);
            if (res1.data.metrics.length > 0) {
                const last = res1.data.metrics[res1.data.metrics.length - 1];
                console.log(`   Last metric storagePrice: ${last.storagePrice} (type: ${typeof last.storagePrice})`);
                if (last.storagePrice) {
                    const scPerTbMonth = (Number(last.storagePrice) * 1e12 * 4320) / 1e24;
                    console.log(`   Converted: ${scPerTbMonth.toFixed(2)} SC/TB/Month`);
                }
            }
        } else {
            console.log(`   ERROR: No metrics in response`);
            console.log(`   Raw response: ${JSON.stringify(res1.data).substring(0, 200)}`);
        }
    } catch (e) {
        console.log(`   ERROR: ${e.message}`);
    }

    console.log("\n2. Testing via Gateway (http://localhost:3000/api/v1/analytics/network/history?period=24h):");
    try {
        const res2 = await httpGet('http://localhost:3000/api/v1/analytics/network/history?period=24h');
        console.log(`   Status: ${res2.status}`);
        if (res2.data.metrics) {
            console.log(`   Metrics count: ${res2.data.metrics.length}`);
            if (res2.data.metrics.length > 0) {
                const last = res2.data.metrics[res2.data.metrics.length - 1];
                console.log(`   Last metric storagePrice: ${last.storagePrice} (type: ${typeof last.storagePrice})`);
            }
        } else {
            console.log(`   ERROR or different format`);
            console.log(`   Raw response: ${JSON.stringify(res2.data).substring(0, 200)}`);
        }
    } catch (e) {
        console.log(`   ERROR: ${e.message}`);
    }

    console.log("\n3. Testing Analytics /network stats endpoint:");
    try {
        const res3 = await httpGet('http://localhost:3002/api/analytics/network');
        console.log(`   Status: ${res3.status}`);
        console.log(`   Response: ${JSON.stringify(res3.data, null, 2)}`);
    } catch (e) {
        console.log(`   ERROR: ${e.message}`);
    }

    console.log("\n=== END DIAGNOSTIC ===");
}

run();
