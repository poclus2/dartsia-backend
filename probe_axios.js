const axios = require('axios'); // Assuming axios is installed in node_modules

async function probe(url) {
    console.log(`\nProbing ${url}...`);
    try {
        const res = await axios.get(url, {
            timeout: 30000,
            headers: { 'User-Agent': 'Sia-Agent' }
        });
        console.log(`Status: ${res.status}`);
        if (Array.isArray(res.data)) {
            console.log(`Is Array: Yes (${res.data.length} items)`);
            if (res.data.length > 0) {
                const first = res.data[0];
                console.log("Keys:", Object.keys(first));
                // Check v2Settings
                if (first.v2Settings) {
                    console.log("HAS v2Settings!");
                    console.log("v2Settings Sample:", JSON.stringify(first.v2Settings, null, 2).substring(0, 300));
                } else {
                    console.log("NO v2Settings found.");
                }

                // Check settings
                console.log("Settings Sample:", JSON.stringify(first.settings || {}, null, 2).substring(0, 300));
            }
        } else if (res.data.hosts) {
            console.log(`Has .hosts prop: Yes (${res.data.hosts.length} items)`);
        } else {
            console.log("Data Type:", typeof res.data);
            // console.log("Body:", JSON.stringify(res.data).substring(0, 200));
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
        if (e.response) {
            console.log(`Status: ${e.response.status}`);
            console.log(`Data: ${JSON.stringify(e.response.data).substring(0, 200)}`);
        }
    }
}

async function run() {
    await probe('https://explorer.siagraph.info/api/hosts?limit=5'); // Try GET
    await probe('https://api.siacentral.com/v2/hosts');
}

run();
