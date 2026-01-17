const axios = require('axios');

async function analyzeBlock(height) {
    try {
        console.log(`Fetching block ${height}...`);
        const response = await axios.get(`http://localhost:3001/api/v1/blocks/search?q=${height}`);
        const block = response.data;

        // Flatten V1 and V2 transactions
        const txs = [
            ...(block.transactions || []),
            ...(block.v2?.transactions || [])
        ];

        console.log(`Found ${txs.length} transactions for block ${height}.`);

        const mapped = txs.map(tx => {
            // 1. Determine Type
            let type = 'transfer';
            if (tx.fileContracts && tx.fileContracts.length > 0) type = 'contract_formation';
            else if (tx.storageProofs && tx.storageProofs.length > 0) type = 'storage_proof';
            else if (tx.fileContractRevisions && tx.fileContractRevisions.length > 0) type = 'contract_renewal';
            else if (tx.arbitraryData && tx.arbitraryData.length > 0) {
                type = 'host_announcement';
            }

            // 2. Calculate Amount (Sum of Siacoin Outputs)
            let amount = 0n;
            try {
                if (tx.siacoinOutputs) {
                    amount = tx.siacoinOutputs.reduce((acc, out) => acc + BigInt(out.value || '0'), 0n);
                }
                if (tx.siacoinOutputsV2) {
                    amount += tx.siacoinOutputsV2.reduce((acc, out) => acc + BigInt(out.value || '0'), 0n);
                }
            } catch (err) {
                console.error("Error calculating amount:", err.message);
            }

            // 3. Fees
            let fee = 0n;
            try {
                if (tx.minerFees) {
                    fee = tx.minerFees.reduce((acc, val) => acc + BigInt(val || '0'), 0n);
                }
            } catch (err) {
                console.error("Error calculating fee:", err.message);
            }

            // Helper to convert to SC (Hastings / 1e24)
            const toSC = (bigInt) => {
                const str = bigInt.toString();
                if (str.length <= 24) return "0." + str.padStart(24, '0').slice(0, 6);
                return str.slice(0, str.length - 24) + "." + str.slice(str.length - 24, str.length - 18);
            };

            return {
                id: tx.id,
                type: type,
                amountSC: toSC(amount),
                feeSC: toSC(fee),
                outputCount: (tx.siacoinOutputs?.length || 0) + (tx.siacoinOutputsV2?.length || 0)
            };
        });

        console.log(JSON.stringify(mapped, null, 2));

    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) console.error("Data:", e.response.data);
    }
}

analyzeBlock(558040);
