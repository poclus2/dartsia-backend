
const fs = require('fs');
const path = require('path');

const targetIds = {
    // 'f4479472894f03d2102cbee1ef7e16bb70a3ac7cf50766cb26d7a89766791c7a': 'Contract Formation',
    'e171ed7c73050bf6ba869e731aebb2476faa083fcef2d28829d57a574c608c4a': 'Storage Proof',
    // '7d78119d37cbdf1c4894c0b751390626395334267c47a5b6d27d5c9d706c97e6': 'Contract Revision',
    // 'd7bc223134aa43491dc495eb1db62e1fded886557cad34811bd79532980f4506': 'Contract Refresh',
    // '61c567fe9135a27b27e171e16fa8882502ecfa7e9433e7c86da580a69a6e8c0e': 'Contract Expiration'
};

function analyzeFile(filename) {
    console.log(`Analyzing ${filename}...`);
    try {
        let content = fs.readFileSync(filename, 'utf16le');
        // Clean up psql output artifacts if any (trim whitespace)
        content = content.trim();

        // Find the start and end of the JSON array
        const start = content.indexOf('[');
        const end = content.lastIndexOf(']');
        if (start === -1 || end === -1) {
            console.log('Could not find JSON array in file.');
            return;
        }
        content = content.substring(start, end + 1);

        // It might be a JSON array of objects
        const txs = JSON.parse(content);
        console.log(`Found ${txs.length} transactions.`);

        for (const tx of txs) {
            if (targetIds[tx.id]) {
                console.log(`\nMATCH: ${targetIds[tx.id]} (${tx.id})`);
                console.log('Keys:', Object.keys(tx));
                if (tx.fileContracts) console.log('  fileContracts:', tx.fileContracts.length);
                if (tx.fileContractRevisions) console.log('  fileContractRevisions:', tx.fileContractRevisions.length);
                if (tx.fileContractResolutions) {
                    console.log('  fileContractResolutions:', tx.fileContractResolutions.length);
                    console.log('  Resolution Value:', JSON.stringify(tx.fileContractResolutions, null, 2));
                }
                if (tx.storageProofs) console.log('  storageProofs:', tx.storageProofs.length);
                if (tx.siacoinInputs) console.log('  siacoinInputs:', tx.siacoinInputs.length);
                if (tx.siacoinOutputs) console.log('  siacoinOutputs:', tx.siacoinOutputs.length);
                if (tx.siafundInputs) console.log('  siafundInputs:', tx.siafundInputs.length);
                if (tx.siafundOutputs) console.log('  siafundOutputs:', tx.siafundOutputs.length);
                if (tx.arbitraryData) console.log('  arbitraryData:', tx.arbitraryData.length);
                if (tx.minerFees) console.log('  minerFees:', tx.minerFees.length);
            }
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

analyzeFile('block_558093_txs.json');
analyzeFile('block_558094_txs.json');
