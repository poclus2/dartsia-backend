const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();

        const period = '24h';
        const limitTimestamp = new Date(Date.now() - 24 * 60 * 60 * 1000);

        console.log("Testing CURRENT AnalyticsService query...\n");

        const metricsQuery = `
        SELECT 
            bucket_inner as bucket,
            COUNT(DISTINCT sub."hostPublicKey") as "activeHosts",
            SUM("avg_storage") as "totalStorage",
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "avg_price") as "storagePrice"
        FROM (
            SELECT 
                date_trunc('${period === '24h' ? 'hour' : 'day'}', m."time") as bucket_inner,
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

        try {
            const result = await client.query(metricsQuery, [limitTimestamp]);
            console.log(`Found ${result.rows.length} time buckets`);

            if (result.rows.length > 0) {
                console.log("\nFirst bucket:");
                console.log(JSON.stringify(result.rows[0], null, 2));

                console.log("\nLast bucket:");
                console.log(JSON.stringify(result.rows[result.rows.length - 1], null, 2));

                // Check if storagePrice is numeric and non-zero
                const lastPrice = result.rows[result.rows.length - 1].storagePrice;
                console.log(`\nLast storagePrice: ${lastPrice} (type: ${typeof lastPrice})`);

                if (lastPrice) {
                    const scPerTbMonth = (Number(lastPrice) * 1e12 * 4320) / 1e24;
                    console.log(`Converted to SC/TB/Month: ${scPerTbMonth.toFixed(2)} SC`);
                }
            } else {
                console.log("NO RESULTS RETURNED - Query returned empty!");
            }
        } catch (err) {
            console.error("Query Error:", err.message);
            console.error("Full error:", err);
        }

        await client.end();
    } catch (e) {
        console.error(e);
    }
}

run();
