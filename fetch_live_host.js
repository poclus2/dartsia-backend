const axios = require('axios');
const https = require('https');

const pubKey = 'ed25519:397e939ab8f06ead2a913196996bafc55c0e46b39828dcb4ebb07e1bb76a13db';

async function run() {
    const agent = new https.Agent({
        rejectUnauthorized: false
    });

    console.log(`Fetching live data for ${pubKey}...`);

    // Configured API
    const url = 'https://explorer.siagraph.info/api/host';

    try {
        // Based on SiaClient implementation, it might be a POST with keys or GET with param
        // worker code: siaClient.getHosts uses /api/hosts (plural) with limit/offset
        // but maybe there is a detail endpoint?

        // Let's try listing hosts with a filter if possible, or usually we can't filter by key effectively on some endpoints.
        // But SiaCentral supports looking up by key.

        // Try SiaGraph explicit host endpoint if it exists, or just dump via SiaCentral for cross-check
        // Because the user wants to know what "data" looks like.

        console.log("Trying SiaCentral V2 (Reliable source)...");
        const resCentral = await axios.get(`https://api.siacentral.com/v2/hosts/${pubKey}`, { httpsAgent: agent, timeout: 5000 });
        console.log("--- SiaCentral V2 Response ---");
        console.log(JSON.stringify(resCentral.data, null, 2));

    } catch (e) {
        console.error("SiaCentral Error:", e.message);
    }
}

run();
