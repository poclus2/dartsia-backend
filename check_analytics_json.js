const axios = require('axios');

async function run() {
    try {
        console.log("Fetching top hosts from local Analytics API...");
        const res = await axios.get('http://localhost:3002/api/analytics/hosts/top?limit=10');
        const hosts = res.data;

        console.log(`Received ${hosts.length} hosts.`);
        if (hosts.length > 0) {
            const h = hosts[0];
            console.log("First Metadata Keys:", Object.keys(h));

            // Check for v2Settings
            const hasV2 = hosts.some(host => host.v2Settings && Object.keys(host.v2Settings).length > 0);
            console.log("Any host has v2Settings?", hasV2);

            if (hasV2) {
                const sample = hosts.find(host => host.v2Settings && Object.keys(host.v2Settings).length > 0);
                console.log("Sample v2Settings:", JSON.stringify(sample.v2Settings, null, 2));
            } else {
                console.log("WARN: v2Settings missing or empty in ALL top 10 hosts.");
                // Try searching for the specific host via database if score is 0 it might not be in top 10
            }
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
