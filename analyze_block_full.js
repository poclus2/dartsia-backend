const axios = require('axios');

async function listAllTransactions(height) {
    try {
        const response = await axios.get(`http://localhost:3001/api/v1/blocks/search?q=${height}`);
        const block = response.data;

        // Dedup
        const v1 = block.transactions || [];
        const v2 = block.v2?.transactions || [];
        const allTxs = [...v1, ...v2];

        const uniqueMap = new Map();
        allTxs.forEach(tx => uniqueMap.set(tx.id, tx));

        const uniqueTxs = Array.from(uniqueMap.values());

        console.log(`Block ${height} - Total Unique Transactions: ${uniqueTxs.length}\n`);

        uniqueTxs.forEach((tx, index) => {
            let type = 'Siacoin Transfer';
            if (tx.fileContracts?.length > 0) type = 'Contract formation';
            else if (tx.storageProofs?.length > 0) type = 'Storage Proof';
            else if (tx.fileContractRevisions?.length > 0) type = 'Contract Revision';
            else if (tx.arbitraryData?.length > 0) type = 'Host Announcement';

            console.log(`${index + 1}. [${type}] ${tx.id}`);
        });

    } catch (e) {
        console.error(e.message);
    }
}

listAllTransactions(534500);
