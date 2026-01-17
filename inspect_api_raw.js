const axios = require('axios');
const https = require('https');

async function run() {
    const httpsAgent = new https.Agent({
        keepAlive: true,
        rejectUnauthorized: false
    });

    const client = axios.create({
        baseURL: 'https://explorer.siagraph.info',
        httpsAgent
    });

    try {
        console.log("Fetching Tip to get a recent block ID...");
        const tipRes = await client.get('/api/consensus/tip');
        const tipId = tipRes.data.id;
        console.log("Tip ID:", tipId);

        console.log("Fetching Block Details...");
        const blockRes = await client.get(`/api/blocks/${tipId}`);
        console.log("Block Keys:", Object.keys(blockRes.data));
        console.log("Transaction Count Field:", blockRes.data.transactionCount);
        console.log("Transactions Array Length:", blockRes.data.transactions ? blockRes.data.transactions.length : "N/A");

        if (blockRes.data.transactions && blockRes.data.transactions.length > 0) {
            console.log("Sample Transaction Keys:", Object.keys(blockRes.data.transactions[0]));
        }

    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) console.log("Response data:", e.response.data);
    }
}

run();
