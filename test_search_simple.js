/**
 * Simple Block Search Test
 * Tests the search endpoint with minimal output
 */

const axios = require('axios');

async function testSearch() {
    const tests = [
        { label: 'Height 557904', url: 'http://localhost:8080/api/v1/explorer/blocks/search?q=557904' },
        { label: 'Height 557940', url: 'http://localhost:8080/api/v1/explorer/blocks/search?q=557940' },
        { label: 'Non-existent', url: 'http://localhost:8080/api/v1/explorer/blocks/search?q=999999999' },
        { label: 'Empty query', url: 'http://localhost:8080/api/v1/explorer/blocks/search?q=' },
    ];

    console.log('Block Search API Test\n');

    for (const test of tests) {
        try {
            const start = Date.now();
            const res = await axios.get(test.url, {
                timeout: 10000,
                headers: { 'x-api-key': 'secret-key-change-me' }
            });
            const duration = Date.now() - start;

            if (res.data) {
                console.log(`✅ ${test.label}: Found block ${res.data.height} (${duration}ms)`);
                console.log(`   ID: ${res.data.id.substring(0, 30)}...`);
                console.log(`   Transactions: ${res.data.transactionsCount || 0}`);

                // Test hash search with this ID
                if (test.label === 'Height 557904') {
                    const hashUrl = `http://localhost:8080/api/v1/explorer/blocks/search?q=${res.data.id}`;
                    try {
                        const hashRes = await axios.get(hashUrl, {
                            timeout: 10000,
                            headers: { 'x-api-key': 'secret-key-change-me' }
                        });
                        if (hashRes.data && hashRes.data.height === res.data.height) {
                            console.log(`✅ Hash search: Works! Found same block by ID`);
                        } else {
                            console.log(`❌ Hash search: Failed - got different block`);
                        }
                    } catch (e) {
                        console.log(`❌ Hash search: Error - ${e.message}`);
                    }
                }
            } else {
                console.log(`✅ ${test.label}: Correctly returned null (${duration}ms)`);
            }
        } catch (error) {
            console.log(`❌ ${test.label}: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
            }
        }
        console.log('');
    }
}

testSearch().catch(console.error);
