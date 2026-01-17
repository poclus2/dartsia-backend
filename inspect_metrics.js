
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();

        // Check Host Settings JSON structure
        console.log("--- Host Settings Sample ---");
        const res = await client.query('SELECT settings FROM hosts WHERE settings IS NOT NULL LIMIT 1');
        if (res.rows.length > 0) {
            console.log(JSON.stringify(res.rows[0].settings, null, 2));
        }

        // Check Host Metrics Price values
        console.log("--- Host Metrics Price Sample ---");
        const res2 = await client.query('SELECT "storagePrice", "uploadPrice" FROM host_metrics ORDER BY time DESC LIMIT 5');
        console.log(res2.rows);

        await client.end();
    } catch (e) {
        console.error(e);
    }
}

run();
