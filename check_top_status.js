const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();
        console.log("Fetching TOP 10 hosts (by score)...");

        // Check score + lastSeen + settings validity
        const query = `
        SELECT "netAddress", "score", "lastSeen", 
        ("lastSeen" > NOW() - INTERVAL '24 hours') as is_active,
        settings->>'totalstorage' as storage
        FROM hosts 
        ORDER BY score DESC 
        LIMIT 10
    `;

        const res = await client.query(query);
        console.log(JSON.stringify(res.rows, null, 2));

        await client.end();
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
