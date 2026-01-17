
const axios = require('axios');

async function test() {
    console.log('Testing connection to https://explorer.siagraph.info...');
    try {
        const client = axios.create({ baseURL: 'https://explorer.siagraph.info' });

        console.log('Fetching Tip...');
        const tipResp = await client.get('/api/consensus/tip');
        console.log('Tip:', tipResp.data);

        console.log('Fetching Block', tipResp.data.id);
        const blockResp = await client.get(`/api/blocks/${tipResp.data.id}`);
        // console.log('Raw Block Data:', JSON.stringify(blockResp.data, null, 2));
        const blockData = blockResp.data;

        console.log('Block Data Height:', blockData.height);
        console.log('Block Data Transactions Length:', blockData.transactions ? blockData.transactions.length : 0);
        console.log('Block Data V2 Link:', blockData.v2 ? 'Present' : 'None');
        if (blockData.v2) {
            console.log('Block Data V2 Transactions Length:', blockData.v2.transactions ? blockData.v2.transactions.length : 0);
        }

        const entity = {
            height: blockData.height,
            id: blockData.id,
            timestamp: new Date(blockData.timestamp),
            transactionCount: blockData.transactionCount ||
                (blockData.v2?.transactions ? blockData.v2.transactions.length : 0) ||
                (blockData.transactions ? blockData.transactions.length : 0),
            transactions: blockData.transactions || blockData.v2?.transactions || [],
        };

        console.log('Entity Transaction Count:', entity.transactionCount);
        console.log('Entity Transactions Array Length:', entity.transactions.length);

    } catch (e) {
        console.error('ERROR:', e.message);
        if (e.response) {
            console.error('Response:', e.response.status, e.response.data);
        }
    }
}

test();
