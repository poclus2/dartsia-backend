const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();

        const period = '24h';
        const limitTimestamp = new Date(Date.now() - 24 * 60 * 60 * 1000);

        console.log("=== TESTING EXACT SQL FROM SERVICE ===\n");
        console.log("Limit timestamp:", limitTimestamp.toISOString());

        const metricsQuery = `
        SELECT 
            bucket_inner as bucket,
            COUNT(DISTINCT sub."hostPublicKey") as "activeHosts",
            SUM("avg_storage") as "totalStorage",
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "avg_price") as "storagePrice"
        FROM (
            SELECT 
                date_trunc('hour', m."time") as bucket_inner,
                m."hostPublicKey",
                AVG(m."remainingStorage") as avg_storage,
                AVG(m."storagePrice") as avg_price
            FROM host_metrics m
            INNER JOIN hosts h ON m."hostPublicKey" = h."publicKey"
            WHERE m."time" > $1
            AND h."lastSeen" > NOW() - INTERVAL '24 hours' 
            AND m."storagePrice" > 0
            GROUP BY 1, 2
        ) sub
        GROUP BY 1
        ORDER BY 1 ASC
    `;

        const result = await client.query(metricsQuery, [limitTimestamp]);

        console.log(`\nRows returned: ${result.rows.length}\n`);

        if (result.rows.length > 0) {
            console.log("First row:");
            console.log(JSON.stringify(result.rows[0], null, 2));

            console.log("\nLast row:");
            const last = result.rows[result.rows.length - 1];
            console.log(JSON.stringify(last, null, 2));

            // Check types
            console.log("\n=== Type Check on Last Row ===");
            console.log("storagePrice:", last.storagePrice, "| type:", typeof last.storagePrice);
            console.log("activeHosts:", last.activeHosts, "| type:", typeof last.activeHosts);

            // Apply same transformation as service
            const transformed = {
                timestamp: last.bucket,
                activeHosts: Number(last.activeHosts) || 0,
                totalStorage: last.totalStorage,
                storagePrice: Number(last.storagePrice) || 0
            };

            console.log("\n=== After Service Transformation ===");
            console.log(JSON.stringify(transformed, null, 2));
            console.log("storagePrice type:", typeof transformed.storagePrice);

            if (transformed.storagePrice > 0) {
                const scPerTbMonth = (transformed.storagePrice * 1e12 * 4320) / 1e24;
                console.log(`\nFinal Display: ${scPerTbMonth.toFixed(2)} SC/TB/Month`);
            }
        } else {
            console.log("NO ROWS RETURNED - Query is empty!");

            // Debug: check if there's ANY data in last 24h
            const debugQuery = `
            SELECT COUNT(*) as total
            FROM host_metrics m
            INNER JOIN hosts h ON m."hostPublicKey" = h."publicKey"
            WHERE m."time" > $1
            AND h."lastSeen" > NOW() - INTERVAL '24 hours'
        `;
            const debugRes = await client.query(debugQuery, [limitTimestamp]);
            console.log("Total metrics in last 24h (active hosts):", debugRes.rows[0].total);

            const debugQuery2 = `
            SELECT COUNT(*) as total
            FROM host_metrics m
            WHERE m."storagePrice" > 0
            AND m."time" > $1
        `;
            const debugRes2 = await client.query(debugQuery2, [limitTimestamp]);
            console.log("Total metrics with price > 0 in last 24h:", debugRes2.rows[0].total);
        }

        await client.end();
    } catch (e) {
        console.error("ERROR:", e.message);
        console.error(e);
    }
}

run();
