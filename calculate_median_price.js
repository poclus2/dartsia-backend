
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();

        console.log("--- Checking Median Storage Price for Active Hosts (>24h) ---");

        // 1. Get raw prices for active hosts
        const query = `
        SELECT m."storagePrice", h."publicKey"
        FROM host_metrics m
        INNER JOIN hosts h ON m."hostPublicKey" = h."publicKey"
        WHERE m."time" > NOW() - INTERVAL '24 hours'
        AND h."lastSeen" > NOW() - INTERVAL '24 hours'
        AND m."storagePrice" > 0
    `;

        const res = await client.query(query);
        const prices = res.rows.map(r => Number(r.storagePrice)).sort((a, b) => a - b);

        console.log(`Total Active Hosts with Price records > 0 in last 24h: ${prices.length}`);

        if (prices.length === 0) {
            console.log("No price records found!");
        } else {
            const min = prices[0];
            const max = prices[prices.length - 1];
            const midIndex = Math.floor(prices.length / 2);
            const median = prices.length % 2 !== 0
                ? prices[midIndex]
                : (prices[midIndex - 1] + prices[midIndex]) / 2;

            console.log(`Min Price: ${min}`);
            console.log(`Max Price: ${max}`);
            console.log(`Median Price (Calculated JS): ${median}`);

            // Show some samples
            console.log("Sample Prices (First 5):", prices.slice(0, 5));

            // Conversion check (Hastings to SC/TB/Month)
            // Formula: (Price * 1e12 * 4320) / 1e24
            const scPerTbMonth = (median * 1e12 * 4320) / 1e24;
            console.log(`Median Price in SC/TB/Month: ${scPerTbMonth.toFixed(2)} SC`);
        }

        await client.end();
    } catch (e) {
        console.error(e);
        await client.end();
    }
}

run();
