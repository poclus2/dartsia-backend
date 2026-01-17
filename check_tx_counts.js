const { Client } = require('pg');

async function run() {
    const client = new Client({
        connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
    });

    try {
        await client.connect();
        // Check finding any block with > 0 transactions
        const res = await client.query('SELECT height, "transactionCount" FROM blocks WHERE "transactionCount" > 0 ORDER BY height DESC LIMIT 10');

        console.log(`Found ${res.rowCount} blocks with > 0 transactions.`);
        if (res.rowCount > 0) {
            console.log("Sample:", res.rows);
        } else {
            // Check top 5 blocks regardless
            const top5 = await client.query('SELECT height, "transactionCount" FROM blocks ORDER BY height DESC LIMIT 5');
            console.log("Top 5 blocks stats:", top5.rows);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

run();
