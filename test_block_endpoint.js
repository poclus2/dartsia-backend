const axios = require('axios');
const https = require('https');

async function testEndpoint(url) {
    const agent = new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true,
        family: 4
    });

    try {
        console.log(`Testing GET ${url}...`);
        const res = await axios.get(url, { httpsAgent: agent, timeout: 5000 });
        console.log(`SUCCESS [${res.status}]:`, JSON.stringify(res.data).substring(0, 100));
        return true;
    } catch (e) {
        if (e.response) {
            console.log(`FAILED [${e.response.status}]: ${e.response.statusText}`);
        } else {
            console.log(`ERROR: ${e.message}`);
        }
        return false;
    }
}

async function run() {
    const baseURL = 'https://explorer.siagraph.info';

    // Test 1: Standard consensus endpoint (often used by siad/renterd)
    // Note: Explored might wrap this
    await testEndpoint(`${baseURL}/api/consensus/block?height=0`);

    // Test 2: Explorer module
    await testEndpoint(`${baseURL}/api/explorer/blocks/0`);

    // Test 3: Maybe just /api/blocks/0
    await testEndpoint(`${baseURL}/api/blocks/0`);

    // Test 4: Tip to see structure
    await testEndpoint(`${baseURL}/api/consensus/tip`);
}

run();
