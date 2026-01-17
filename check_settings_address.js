const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();

        // Find a host with null netAddress but valid settings
        const query = `
        SELECT "publicKey", "netAddress", "settings"
        FROM hosts 
        WHERE "lastSeen" > NOW() - INTERVAL '24 hours'
        AND ("netAddress" IS NULL OR "netAddress" = '')
        AND "settings" IS NOT NULL
        LIMIT 1
    `;

        const res = await client.query(query);
        if (res.rows.length > 0) {
            console.log("Found host with NULL netAddress:");
            console.log("Settings keys:", Object.keys(res.rows[0].settings));
            console.log("Settings.netaddress:", res.rows[0].settings.netaddress);
        } else {
            console.log("No active hosts with NULL address found??");
        }

        await client.end();
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
