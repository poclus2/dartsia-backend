const axios = require('axios');

async function analyzeBlock(height) {
    try {
        const response = await axios.get(`http://localhost:3001/api/v1/blocks/search?q=${height}`);
        const block = response.data;
        const txs = [...(block.transactions || []), ...(block.v2?.transactions || [])];

        const mapped = txs.map(tx => {
            let type = 'transfer';
            if (tx.fileContracts && tx.fileContracts.length > 0) type = 'contract_formation';
            else if (tx.storageProofs && tx.storageProofs.length > 0) type = 'storage_proof';
            else if (tx.fileContractRevisions && tx.fileContractRevisions.length > 0) type = 'contract_renewal';
            else if (tx.arbitraryData && tx.arbitraryData.length > 0) type = 'host_announcement';

            let amount = 0n;
            try {
                if (tx.siacoinOutputs) amount = tx.siacoinOutputs.reduce((acc, out) => acc + BigInt(out.value || '0'), 0n);
                if (tx.siacoinOutputsV2) amount += tx.siacoinOutputsV2.reduce((acc, out) => acc + BigInt(out.value || '0'), 0n);
            } catch (e) { }

            let fee = 0n;
            try {
                if (tx.minerFees) fee = tx.minerFees.reduce((acc, val) => acc + BigInt(val || '0'), 0n);
            } catch (e) { }

            const toSC = (bigInt) => {
                const str = bigInt.toString();
                if (str === '0') return '0';
                if (str.length <= 24) return "0." + str.padStart(24, '0').slice(0, 6);
                return str.slice(0, str.length - 24) + "." + str.slice(str.length - 24, str.length - 18);
            };

            return { id: tx.id, type, amountSC: toSC(amount), fee: toSC(fee) };
        });

        // Summary
        const counts = mapped.reduce((acc, tx) => { acc[tx.type] = (acc[tx.type] || 0) + 1; return acc; }, {});
        console.log("=== Summary ===");
        console.log(JSON.stringify(counts, null, 2));
        console.log("\n=== First 5 Transactions ===");
        console.log(JSON.stringify(mapped.slice(0, 5), null, 2));

    } catch (e) { console.error(e.message); }
}

analyzeBlock(558040);
