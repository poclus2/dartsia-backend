const axios = require('axios');

async function test() {
    console.log('Testing Block Search API...\n');

    // Test 1: Search by height
    try {
        const res1 = await axios.get('http://localhost:3001/api/v1/blocks/search?q=557904');
        console.log('Test 1 - Height 557904: PASS');
        console.log(`  Block height: ${res1.data.height}`);
        console.log(`  Transactions: ${res1.data.transactionsCount}`);
        console.log(`  Has tx array: ${res1.data.transactions ? 'Yes' : 'No'}\n`);

        // Test 2: Search by hash
        const hash = res1.data.id;
        const res2 = await axios.get(`http://localhost:3001/api/v1/blocks/search?q=${hash}`);
        if (res2.data && res2.data.height === 557904) {
            console.log('Test 2 - Hash search: PASS');
            console.log(`  Found same block by hash\n`);
        } else {
            console.log('Test 2 - Hash search: FAIL\n');
        }
    } catch (e) {
        console.log(`Test 1/2 FAIL: ${e.message}\n`);
    }

    // Test 3: Non-existent block
    try {
        const res3 = await axios.get('http://localhost:3001/api/v1/blocks/search?q=999999999');
        console.log(`Test 3 - Non-existent: ${res3.data === null ? 'PASS (null)' : 'FAIL (got data)'}\n`);
    } catch (e) {
        console.log(`Test 3 FAIL: ${e.message}\n`);
    }

    console.log('Done!');
}

test();
