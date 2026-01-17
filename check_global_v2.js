const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();

        console.log("Checking count of hosts with non-empty v2Settings...");

        // Check for non-null and non-empty jsonb
        const res = await client.query(`
        SELECT count(*) as count
        FROM hosts 
        WHERE "v2Settings" IS NOT NULL 
          AND "v2Settings" <> '{}'::jsonb
    `);

        console.log(`Hosts with v2Settings: ${res.rows[0].count}`);

        if (parseInt(res.rows[0].count) > 0) {
            const sample = await client.query(`
            SELECT "publicKey", "v2Settings" 
            FROM hosts 
            WHERE "v2Settings" IS NOT NULL 
              AND "v2Settings" <> '{}'::jsonb
            LIMIT 1
        `);
            console.log("Sample Host:", sample.rows[0].publicKey);
            console.log("Sample Data Keys:", Object.keys(sample.rows[0].v2Settings));
        } else {
            console.log("WARN: No hosts have v2Settings populated yet.");
        }

        await client.end();
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
