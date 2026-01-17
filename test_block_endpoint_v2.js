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
            console.log(`FAILED [${e.response.status}]: ${e.response.statusText} - ${JSON.stringify(e.response.data)}`);
        } else {
            console.log(`ERROR: ${e.message}`);
        }
        return false;
    }
}

async function run() {
    const baseURL = 'https://explorer.siagraph.info';
    const height = 550000;

    // Test 1: Explorer module with valid height
    await testEndpoint(`${baseURL}/api/explorer/blocks/${height}`);

    // Test 2: Consensus module with query param
    await testEndpoint(`${baseURL}/api/consensus/block?height=${height}`);

    // Test 3: Root blocks
    await testEndpoint(`${baseURL}/api/blocks/${height}`);
}

run();
