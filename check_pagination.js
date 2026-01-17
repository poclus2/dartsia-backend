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
        console.log("Fetching Page 1 (offset=0, limit=5)...");
        const res1 = await axiosInstance.post(`/api/hosts?limit=5&offset=0`, {});
        const page1 = res1.data;
        const ids1 = page1.map(h => h.publicKey);
        console.log("Page 1 IDs:", ids1);

        console.log("Fetching Page 2 (offset=5, limit=5)...");
        const res2 = await axiosInstance.post(`/api/hosts?limit=5&offset=5`, {});
        const page2 = res2.data;
        const ids2 = page2.map(h => h.publicKey);
        console.log("Page 2 IDs:", ids2);

        if (ids1[0] && ids1[0] === ids2[0]) {
            console.log("FAIL: Pagination appears BROKEN (Page 1 == Page 2).");
        } else {
            console.log("SUCCESS: Pagination seems working (IDs differ).");
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
