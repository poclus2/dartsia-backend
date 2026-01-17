const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();

        // Check specific column
        const res = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'hosts' AND column_name = 'v2Settings'
    `);

        if (res.rows.length > 0) {
            console.log("SUCCESS: Column 'v2Settings' EXISTS.");
        } else {
            // TypeORM might lowercase columns?
            const res2 = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'hosts' AND column_name = 'v2settings'
        `);
            if (res2.rows.length > 0) {
                console.log("SUCCESS: Column 'v2settings' EXISTS (lowercase).");
            } else {
                console.log("FAILURE: Column 'v2Settings' NOT FOUND.");
                // Log all cols to be sure
                const all = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='hosts'`);
                console.log("All cols:", all.rows.map(r => r.column_name).join(', '));
            }
        }

        await client.end();
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
