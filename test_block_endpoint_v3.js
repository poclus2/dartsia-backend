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
            console.log(`FAILED [${e.response.status}]: ${e.response.statusText} - ${JSON.stringify(e.response.data).substring(0, 200)}`);
        } else {
            console.log(`ERROR: ${e.message}`);
        }
        return false;
    }
}

async function run() {
    const baseURL = 'https://explorer.siagraph.info';

    // 1. Get Tip to get a valid ID
    console.log("Fetching Tip ID...");
    const agent = new https.Agent({ rejectUnauthorized: false, keepAlive: true, family: 4 });
    let tipId = "";
    try {
        const tipRes = await axios.get(`${baseURL}/api/consensus/tip`, { httpsAgent: agent });
        tipId = tipRes.data.id;
        console.log("Tip ID:", tipId);
    } catch (e) {
        console.log("Failed to get tip:", e.message);
        return;
    }

    // 2. Test Get Block By ID
    await testEndpoint(`${baseURL}/api/blocks/${tipId}`);

    // 3. Test Consensus Headers Range (Common in siad)
    await testEndpoint(`${baseURL}/api/consensus/headers?begin=550000&end=550005`);

    // 4. Test Explorer Block Range
    await testEndpoint(`${baseURL}/api/explorer/blocks?start=550000&end=550005`);
}

run();
