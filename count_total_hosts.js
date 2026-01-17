const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();

        // Active hosts (seen in last 24h)
        const resActive = await client.query(`
        SELECT COUNT(*) as count 
        FROM hosts 
        WHERE "lastSeen" > NOW() - INTERVAL '24 hours'
    `);
        console.log(`Active Hosts (last 24h): ${resActive.rows[0].count}`);

        // Total known hosts
        const resTotal = await client.query('SELECT COUNT(*) as count FROM hosts');
        console.log(`Total Known Hosts in DB: ${resTotal.rows[0].count}`);

        await client.end();
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
