const http = require('http');

function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: data, parseError: e.message });
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    console.log("=== POST-FIX VERIFICATION ===\n");

    const res = await httpGet('http://localhost:3002/api/analytics/network/history?period=24h');

    console.log("Status:", res.status);

    if (res.data && res.data.metrics) {
        console.log("Metrics count:", res.data.metrics.length);

        if (res.data.metrics.length > 0) {
            const last = res.data.metrics[res.data.metrics.length - 1];
            console.log("\n=== Last Metric Entry ===");
            console.log("timestamp:", last.timestamp);
            console.log("activeHosts:", last.activeHosts, "(type:", typeof last.activeHosts, ")");
            console.log("storagePrice:", last.storagePrice, "(type:", typeof last.storagePrice, ")");
            console.log("totalStorage:", last.totalStorage, "(type:", typeof last.totalStorage, ")");

            // Test conversion (same as frontend)
            if (last.storagePrice !== undefined && last.storagePrice !== null) {
                const num = Number(last.storagePrice);
                console.log("\nNumber(storagePrice):", num);
                if (num > 0) {
                    const scPerTbMonth = (num * 1e12 * 4320) / 1e24;
                    console.log("Converted to SC/TB/Month:", scPerTbMonth.toFixed(2), "SC");
                } else {
                    console.log("ERROR: Number conversion resulted in 0 or NaN");
                }
            } else {
                console.log("ERROR: storagePrice is undefined or null");
            }

            console.log("\n=== First 3 metrics ===");
            res.data.metrics.slice(0, 3).forEach((m, i) => {
                console.log(`[${i}] price=${m.storagePrice} (${typeof m.storagePrice})`);
            });
        }
    } else {
        console.log("ERROR: No metrics in response");
        console.log("Raw:", JSON.stringify(res.data || res.raw).substring(0, 300));
    }
}

run();
