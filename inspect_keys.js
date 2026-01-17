
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();
        const res = await client.query('SELECT settings FROM hosts WHERE settings IS NOT NULL LIMIT 1');
        if (res.rows.length > 0) {
            console.log("Keys:", Object.keys(res.rows[0].settings));
            console.log("Values partial:", JSON.stringify(res.rows[0].settings).substring(0, 200));
        }
        await client.end();
    } catch (e) {
        console.error(e);
    }
}

run();
