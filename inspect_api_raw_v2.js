const axios = require('axios');
const https = require('https');

async function run() {
    // Ignore self-signed certs if any, though siagraph usually has valid certs
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false
    });

    const client = axios.create({
        baseURL: 'https://explorer.siagraph.info',
        httpsAgent,
        timeout: 10000
    });

    try {
        console.log("1. Fetching Tip...");
        const tipRes = await client.get('/api/consensus/tip');
        const tip = tipRes.data;
        console.log(`   Tip Height: ${tip.height}, ID: ${tip.id}`);

        console.log(`2. Fetching Block details for ${tip.id}...`);
        const blockRes = await client.get(`/api/blocks/${tip.id}`);
        const b = blockRes.data;

        console.log("\n=== BLOCK JSON KEYS ===");
        console.log(Object.keys(b).sort());

        console.log("\n=== SPECIFIC FIELDS ===");
        console.log("transactionCount:", b.transactionCount);
        console.log("transactions (type):", Array.isArray(b.transactions) ? `Array[${b.transactions.length}]` : typeof b.transactions);

        if (b.transactions && b.transactions.length > 0) {
            console.log("\n=== SAMPLE TRANSACTION (First) ===");
            console.log(Object.keys(b.transactions[0]));
        } else {
            console.log("\n(No transactions in this block to inspect structure)");
        }

        console.log("\n=== FULL DUMP (First 500 chars) ===");
        console.log(JSON.stringify(b).substring(0, 500) + "...");

    } catch (e) {
        console.error("\nCRITICAL ERROR:");
        console.error("Message:", e.message);
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", e.response.data);
        } else if (e.request) {
            console.error("No response received.");
        }
    }
}

run();
