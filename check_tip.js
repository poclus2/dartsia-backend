const axios = require('axios');
const https = require('https');

async function run() {
    const agent = new https.Agent({
        rejectUnauthorized: false
    });

    const axiosInstance = axios.create({
        baseURL: 'https://explorer.siagraph.info',
        httpsAgent: agent,
        timeout: 10000
    });

    try {
        console.log("Fetching consensus tip...");
        const res = await axiosInstance.get('/api/consensus/tip');
        console.log("Tip Data:", res.data);
    } catch (e) {
        if (e.response) {
            console.error("API Error Status:", e.response.status);
            console.error("API Error Data:", e.response.data);
        } else {
            console.error("Error:", e.message);
        }
    }
}

run();
