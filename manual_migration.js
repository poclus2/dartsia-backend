const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();

        console.log("Checking for v2Settings column...");
        const check = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'hosts' AND column_name = 'v2Settings'
    `);

        if (check.rows.length === 0) {
            console.log("Column missing. Adding 'v2Settings' (jsonb)...");
            // We use double quotes to preserve CamelCase matches TypeORM entity
            await client.query(`ALTER TABLE hosts ADD COLUMN "v2Settings" jsonb DEFAULT '{}'`);
            console.log("Migration SUCCESS: Column added.");
        } else {
            console.log("Column already exists.");
        }

        await client.end();
    } catch (e) {
        console.error("Migration Error:", e.message);
    }
}

run();
