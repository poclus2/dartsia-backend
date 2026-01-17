
const axios = require('axios');

async function run() {
    try {
        console.log("Fetching /api/metrics/host...");
        // Use the URL from .env
        const url = 'https://explorer.siagraph.info/api/metrics/host';
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Sia-Agent' } });
        console.log(JSON.stringify(data, null, 2));

        console.log("\nFetching /api/hosts (sample)...");
        const hosts = await axios.post('https://explorer.siagraph.info/api/hosts?limit=10&offset=0', {});
        console.log("Host[0] settings:", JSON.stringify(hosts.data[0]?.settings, null, 2));

    } catch (e) {
        console.error(e.message);
    }
}

run();
