/**
 * Direct Explorer Service Test (No Gateway)
 * Tests the search endpoint directly on port 3001
 */

const axios = require('axios');

async function testSearch() {
    const tests = [
        { label: 'Height 557904', query: '557904' },
        { label: 'Height 557940', query: '557940' },
        { label: 'Non-existent', query: '999999999' },
        { label: 'Empty query', query: '' },
    ];

    console.log('='.repeat(60));
    console.log('Block Search API Test - Direct Explorer Service');
    console.log('Testing: http://localhost:3001/api/v1/blocks/search');
    console.log('='.repeat(60) + '\n');

    let blockHash = null;

    for (const test of tests) {
        const url = `http://localhost:3001/api/v1/blocks/search?q=${encodeURIComponent(test.query)}`;

        try {
            const start = Date.now();
            const res = await axios.get(url, { timeout: 10000 });
            const duration = Date.now() - start;

            if (res.data) {
                console.log(`✅ ${test.label}:`);
                console.log(`   Height: ${res.data.height}`);
                console.log(`   ID: ${res.data.id.substring(0, 40)}...`);
                console.log(`   Transactions Count: ${res.data.transactionsCount || 0}`);
                console.log(`   Has transactions array: ${res.data.transactions ? 'Yes (' + res.data.transactions.length + ')' : 'No'}`);
                console.log(`   Duration: ${duration}ms`);

                // Store hash for hash test
                if (test.label === 'Height 557904') {
                    blockHash = res.data.id;
                }
            } else {
                console.log(`✅ ${test.label}: Correctly returned null (${duration}ms)`);
            }
        } catch (error) {
            console.log(`❌ ${test.label}: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Data: ${JSON.stringify(error.response.data)}`);
            }
        }
        console.log('');
    }

    // Test hash search
    if (blockHash) {
        console.log('--- Testing Hash Search ---\n');
        const hashUrl = `http://localhost:3001/api/v1/blocks/search?q=${encodeURIComponent(blockHash)}`;

        try {
            const start = Date.now();
            const res = await axios.get(hashUrl, { timeout: 10000 });
            const duration = Date.now() - start;

            if (res.data && res.data.height === 557904) {
                console.log(`✅ Hash Search: SUCCESS!`);
                console.log(`   Found block ${res.data.height} using full hash ID`);
                console.log(`   Duration: ${duration}ms`);
            } else {
                console.log(`❌ Hash Search: Found wrong block or null`);
            }
        } catch (error) {
            console.log(`❌ Hash Search: ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Test Complete');
    console.log('='.repeat(60));
}

testSearch().catch(console.error);
