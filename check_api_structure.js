const axios = require('axios');
const https = require('https');

async function run() {
    const agent = new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true,
        family: 4
    });

    const axiosInstance = axios.create({
        baseURL: 'https://explorer.siagraph.info',
        httpsAgent: agent,
        timeout: 10000
    });

    try {
        console.log("Fetching 1 host...");
        const res = await axiosInstance.post(`/api/hosts?limit=1&offset=0`, {});
        const list = res.data;

        if (Array.isArray(list) && list.length > 0) {
            const h = list[0];
            console.log("Top-level keys:", Object.keys(h));
            if (h.v2Settings) console.log("v2Settings FOUND (Type: " + typeof h.v2Settings + ")");
            else console.log("v2Settings NOT FOUND in list object.");

            if (h.settings) console.log("settings FOUND");

            // Check for other potential names
            const candidates = ['rhp3', 'rhp3_settings', 'v2', 'priceTable'];
            candidates.forEach(c => {
                if (h[c]) console.log(`Potential candidate found: ${c}`);
            });

        } else {
            console.log("No hosts returned.");
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
