const { Client } = require('pg');

async function run() {
    const client = new Client({
        connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
    });

    try {
        await client.connect();
        const res = await client.query('SELECT "minerPayouts", "transactionCount" FROM blocks ORDER BY height DESC LIMIT 1');
        if (res.rows.length > 0) {
            console.log("Transaction Count:", res.rows[0].transactionCount);
            console.log("Miner Payouts Structure:");
            console.log(JSON.stringify(res.rows[0].minerPayouts, null, 2));
        } else {
            console.log("No blocks found.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

run();
