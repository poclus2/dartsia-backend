const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();

        console.log("Listing columns for table 'hosts':");
        const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'hosts'
        ORDER BY column_name
    `);

        res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));

        // Now try to select using the names found
        const hasV2 = res.rows.find(r => r.column_name.toLowerCase() === 'v2settings');

        if (hasV2) {
            console.log(`\nFound target column: ${hasV2.column_name}`);
            const pubKeyFragment = '397e939ab8f06ead2a913196996bafc55c0e46b39828dcb4ebb07e1bb76a13db';
            // Use double quotes if mixed case, otherwise plain
            const colIdentifier = `"${hasV2.column_name}"`;

            const query = `SELECT "publicKey", "netAddress", "settings", ${colIdentifier} as v2_data FROM hosts WHERE "publicKey" LIKE '%${pubKeyFragment}%'`;
            console.log("Running:", query);

            const hostRes = await client.query(query);
            if (hostRes.rows.length > 0) {
                const h = hostRes.rows[0];
                console.log("Settings keys:", h.settings ? Object.keys(h.settings) : 'NULL');
                console.log("v2Settings:", h.v2_data ? JSON.stringify(h.v2_data) : 'NULL');
            } else {
                console.log("Host not found.");
            }
        } else {
            console.log("CRITICAL: v2Settings column NOT FOUND in schema.");
        }

        await client.end();
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
