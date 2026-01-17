/**
 * Test script for Block Search API
 * Tests the /api/v1/explorer/blocks/search endpoint
 * 
 * Usage: node test_block_search.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Direct explorer service
const GATEWAY_URL = 'http://localhost:8080'; // Gateway (frontend proxy)

// Test cases
const testCases = [
    {
        name: 'Search by block height (numeric)',
        query: '557904',
        expectedType: 'object',
        shouldFind: true
    },
    {
        name: 'Search by block height (recent)',
        query: '557940',
        expectedType: 'object',
        shouldFind: true
    },
    {
        name: 'Search by partial block hash',
        query: 'bid:000000000000',
        expectedType: 'object',
        shouldFind: false // Partial hash won't work with current implementation
    },
    {
        name: 'Search by full block hash (if available)',
        query: '', // Will be filled dynamically
        expectedType: 'object',
        shouldFind: true
    },
    {
        name: 'Search non-existent block',
        query: '999999999',
        expectedType: 'null',
        shouldFind: false
    },
    {
        name: 'Empty search query',
        query: '',
        expectedType: 'null',
        shouldFind: false
    }
];

async function testSearchEndpoint(baseUrl, label) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${label}`);
    console.log(`Base URL: ${baseUrl}`);
    console.log(`${'='.repeat(60)}\n`);

    let fullBlockHash = null;

    for (const testCase of testCases) {
        // Skip hash test if we don't have a hash yet
        if (testCase.name.includes('full block hash') && !fullBlockHash) {
            console.log(`⏭️  Skipping: ${testCase.name} (no hash available yet)\n`);
            continue;
        }

        const query = testCase.name.includes('full block hash') ? fullBlockHash : testCase.query;

        console.log(`📝 Test: ${testCase.name}`);
        console.log(`   Query: "${query}"`);

        try {
            const url = `${baseUrl}/api/v1/explorer/blocks/search?q=${encodeURIComponent(query)}`;
            console.log(`   URL: ${url}`);

            const startTime = Date.now();
            const response = await axios.get(url, { timeout: 10000 });
            const duration = Date.now() - startTime;

            const data = response.data;
            const dataType = data === null ? 'null' : typeof data;

            console.log(`   ✅ Status: ${response.status}`);
            console.log(`   ⏱️  Duration: ${duration}ms`);
            console.log(`   📦 Response type: ${dataType}`);

            if (data) {
                console.log(`   📊 Block Details:`);
                console.log(`      - Height: ${data.height}`);
                console.log(`      - ID: ${data.id?.substring(0, 20)}...`);
                console.log(`      - Transactions: ${data.transactionsCount || data.transactions?.length || 0}`);
                console.log(`      - Timestamp: ${data.timestamp}`);

                // Store hash for later test
                if (testCase.name.includes('numeric') && !fullBlockHash) {
                    fullBlockHash = data.id;
                    console.log(`   💾 Stored hash for later test: ${fullBlockHash.substring(0, 30)}...`);
                }

                // Verify transaction normalization
                if (data.transactions && data.transactions.length > 0) {
                    console.log(`   ✅ Transactions array populated (${data.transactions.length} txns)`);
                } else if (data.transactionsCount > 0) {
                    console.log(`   ⚠️  Transaction count is ${data.transactionsCount} but transactions array is empty/missing`);
                }
            } else {
                console.log(`   ℹ️  No block found (null response)`);
            }

            // Validate expectations
            if (testCase.shouldFind && !data) {
                console.log(`   ❌ FAIL: Expected to find block but got null`);
            } else if (!testCase.shouldFind && data) {
                console.log(`   ⚠️  WARNING: Expected null but got data`);
            } else {
                console.log(`   ✅ PASS: Result matches expectation`);
            }

        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            if (error.response) {
                console.log(`      Status: ${error.response.status}`);
                console.log(`      Data: ${JSON.stringify(error.response.data)}`);
            }
        }

        console.log('');
    }
}

async function runTests() {
    console.log('\n🧪 Block Search API Test Suite');
    console.log('================================\n');

    // Test 1: Direct Explorer Service
    try {
        await testSearchEndpoint(BASE_URL, 'Direct Explorer Service (Port 3000)');
    } catch (error) {
        console.log(`\n❌ Failed to test direct explorer service: ${error.message}\n`);
    }

    // Test 2: Via Gateway
    try {
        await testSearchEndpoint(GATEWAY_URL, 'Via Gateway (Port 8080)');
    } catch (error) {
        console.log(`\n❌ Failed to test via gateway: ${error.message}\n`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test suite completed');
    console.log('='.repeat(60) + '\n');
}

// Run tests
runTests().catch(console.error);
