const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();
        const query = `
        SELECT "publicKey", "netAddress", "lastSeen", "score", "countryCode" 
        FROM hosts 
        WHERE "netAddress" LIKE '%tutemwesi%'
        OR "netAddress" = 'sia.tutemwesi.com:9984'
    `;

        console.log("Searching for 'sia.tutemwesi.com:9984'...");
        const res = await client.query(query);

        if (res.rows.length > 0) {
            console.log("FOUND!");
            console.log(JSON.stringify(res.rows[0], null, 2));
        } else {
            console.log("Host NOT FOUND in database.");
        }

        await client.end();
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
