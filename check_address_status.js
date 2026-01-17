const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();

        // Check hosts seen in last 24h that have empty/null netAddress
        const query = `
        SELECT "publicKey", "netAddress", "lastSeen"
        FROM hosts 
        WHERE "lastSeen" > NOW() - INTERVAL '24 hours'
        AND ("netAddress" IS NULL OR "netAddress" = '')
        LIMIT 5
    `;

        const res = await client.query(query);
        console.log(`Active hosts with missing Address: ${res.rows.length} (showing max 5)`);
        if (res.rows.length > 0) {
            console.log(JSON.stringify(res.rows, null, 2));
        }

        // Check valid ones
        const queryValid = `
        SELECT "netAddress"
        FROM hosts 
        WHERE "lastSeen" > NOW() - INTERVAL '24 hours'
        AND "netAddress" IS NOT NULL AND "netAddress" != ''
        LIMIT 3
    `;
        const resValid = await client.query(queryValid);
        console.log(`Sample valid addresses:`);
        console.log(JSON.stringify(resValid.rows, null, 2));

        await client.end();
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
