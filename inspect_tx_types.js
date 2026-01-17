
const axios = require('axios');

const txIds = [
    { id: 'f4479472894f03d2102cbee1ef7e16bb70a3ac7cf50766cb26d7a89766791c7a', expected: 'Contract Formation' },
    { id: 'e171ed7c73050bf6ba869e731aebb2476faa083fcef2d28829d57a574c608c4a', expected: 'Storage Proof' },
    { id: '7d78119d37cbdf1c4894c0b751390626395334267c47a5b6d27d5c9d706c97e6', expected: 'Contract Revision' },
    { id: 'd7bc223134aa43491dc495eb1db62e1fded886557cad34811bd79532980f4506', expected: 'Contract Refresh' },
    { id: '61c567fe9135a27b27e171e16fa8882502ecfa7e9433e7c86da580a69a6e8c0e', expected: 'Contract Expiration' }
];

async function inspect() {
    for (const item of txIds) {
        try {
            console.log(`\n--- Fetching ${item.expected} (${item.id}) ---`);
            const response = await axios.get(`https://explorer.siagraph.info/api/transactions/${item.id}`);
            const tx = response.data;

            const keys = Object.keys(tx);
            console.log('Top level keys:', keys);

            if (tx.fileContracts) console.log('fileContracts length:', tx.fileContracts.length);
            if (tx.fileContractRevisions) console.log('fileContractRevisions length:', tx.fileContractRevisions.length);
            if (tx.storageProofs) console.log('storageProofs length:', tx.storageProofs.length);
            if (tx.siacoinInputs) console.log('siacoinInputs length:', tx.siacoinInputs.length);
            if (tx.siacoinOutputs) console.log('siacoinOutputs length:', tx.siacoinOutputs.length);
            if (tx.siafundInputs) console.log('siafundInputs length:', tx.siafundInputs.length);
            if (tx.siafundOutputs) console.log('siafundOutputs length:', tx.siafundOutputs.length);
            if (tx.arbitraryData) console.log('arbitraryData length:', tx.arbitraryData.length);
            if (tx.minerFees) console.log('minerFees length:', tx.minerFees.length);

            // Check specific fields that might indicate type
        } catch (e) {
            console.error(`Error fetching ${item.id}:`, e.message);
        }
    }
}

inspect();
