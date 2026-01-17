const axios = require('axios');

async function debugBlock(height) {
    try {
        const response = await axios.get(`http://localhost:3001/api/v1/blocks/search?q=${height}`);
        const block = response.data;

        const v1 = block.transactions || [];
        const v2 = block.v2?.transactions || [];

        if (v1.length > 0 && v2.length > 0) {
            const t1 = v1[0];
            const t2 = v2[0];
            console.log("--- V1 vs V2 Comparison ---");
            console.log("V1 Keys:", Object.keys(t1).join(', '));
            console.log("V2 Keys:", Object.keys(t2).join(', '));

            if (JSON.stringify(t1) === JSON.stringify(t2)) {
                console.log("V1 and V2 objects are IDENTICAL.");
            } else {
                console.log("V1 and V2 objects are DIFFERENT.");
            }
        }

    } catch (e) {
        console.error(e.message);
    }
}

debugBlock(558040);
