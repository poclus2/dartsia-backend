const axios = require('axios');
const https = require('https');

async function run() {
    // Test local explorer endpoint (running in docker, mapped to host port 3334 usually, or accessed via gateway on 3333)
    // Check docker-compose/frontend proxy. Usually gateway is 3333, explorer might be internal.
    // Let's assume gateway routes /api/blocks to explorer.

    // Check .env or code for port. Explorer is typically 3000 internal, maybe exposed?
    // Let's try to hit the gateway if possible, or assume localhost access if ports are mapped.
    // Looking at user's context, ports are likely mapped.

    // Helper to try ports
    const ports = [3001, 3333, 3334, 3000];

    const port = 3001; // Explorer port
    try {
        console.log(`1. Testing Height: http://localhost:${port}/api/blocks/557905...`);
        const resHeight = await axios.get(`http://localhost:${port}/api/blocks/557905`, { timeout: 10000 });
        console.log(`SUCCESS: Retrieved block 557905`);
        const block = resHeight.data;
        console.log(`- Transactions: ${block.transactions ? block.transactions.length : 'MISSING'} (Expected: >0)`);
        console.log(`- ID: ${block.id}`);

        if (block.id) {
            console.log(`2. Testing ID: http://localhost:${port}/api/blocks/${block.id}...`);
            const resId = await axios.get(`http://localhost:${port}/api/blocks/${block.id}`, { timeout: 10000 });
            console.log(`SUCCESS: Retrieved block by ID ${block.id.substr(0, 10)}...`);

            console.log(`3. Testing Search: http://localhost:${port}/api/blocks/search?q=${block.id}...`);
            const resSearch = await axios.get(`http://localhost:${port}/api/blocks/search?q=${block.id}`, { timeout: 10000 });
            console.log(`SUCCESS: Found block via Search`);
        }
        return;
    } catch (e) {
        console.log(`Failed: ${e.message}`);
        if (e.response) console.log("Response:", e.response.status);
    }
}

run();
