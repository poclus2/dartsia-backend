
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();
        // Check if ANY host has non-zero price
        const res = await client.query('SELECT MAX("storagePrice") as max_price FROM host_metrics');
        console.log("Max Price:", res.rows[0]);

        // Check count of non-zero
        const res2 = await client.query('SELECT COUNT(*) FROM host_metrics WHERE "storagePrice" > 0');
        console.log("Count > 0:", res2.rows[0]);

        await client.end();
    } catch (e) {
        console.error(e);
    }
}

run();
