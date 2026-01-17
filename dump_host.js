const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();

        // Key from user request
        const pubKeyFragment = '397e939ab8f06ead2a913196996bafc55c0e46b39828dcb4ebb07e1bb76a13db';

        console.log(`Searching for host *${pubKeyFragment}...`);

        const query = `
        SELECT "publicKey", "netAddress", "lastSeen", "settings", "v2Settings"
        FROM hosts 
        WHERE "publicKey" LIKE '%${pubKeyFragment}%'
    `;

        const res = await client.query(query);

        if (res.rows.length > 0) {
            const host = res.rows[0];
            console.log("=== HOST DATA ===");
            console.log("PubKey:", host.publicKey);
            console.log("LastSeen:", host.lastSeen);

            const v2 = host.v2Settings;
            const v2Empty = !v2 || Object.keys(v2).length === 0;
            console.log("v2Settings Empty:", v2Empty);

            if (!v2Empty) {
                console.log("v2Settings Keys:", Object.keys(v2).slice(0, 5));
                console.log("v2.total_storage (or variant):", v2.total_storage || v2.totalStorage);
                console.log("v2.prices (or variant):", v2.prices || v2.storage_price);
            } else {
                console.log("RAW v2:", v2);
            }
        } else {
            console.log("Host NOT FOUND in DB.");
        }

        await client.end();
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
