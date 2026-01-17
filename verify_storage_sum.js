const axios = require('axios');
const API = 'https://explorer.siagraph.info';

async function run() {
    try {
        let totalStorage = 0n;
        let activeCount = 0;
        let offset = 0;
        const limit = 1000;
        let loops = 0;

        while (true) {
            console.log(`Fetching offset ${offset}...`);
            const res = await axios.post(`${API}/api/hosts?limit=${limit}&offset=${offset}`, {}, { timeout: 20000 });
            const hosts = res.data;
            if (!hosts || hosts.length === 0) break;

            const now = Date.now();
            const OneDay = 24 * 60 * 60 * 1000;

            for (const h of hosts) {
                // Check active
                // Siagraph might use lastScanSuccessful or lastSeen
                let lastSeen = 0;
                // Try to handle various date formats if necessary, assuming ISO string or timestamp
                const ls = h.lastScanSuccessful || h.lastSeen;
                if (ls) {
                    lastSeen = new Date(ls).getTime();
                }

                if (now - lastSeen < OneDay) {
                    activeCount++;
                    /*
                     settings might be null if not scanned.
                     structure should be h.settings.totalstorage (string)
                    */
                    if (h.settings && h.settings.totalstorage) {
                        totalStorage += BigInt(h.settings.totalstorage);
                    }
                }
            }

            offset += limit;
            loops++;
            // Safety break
            if (loops > 100) break;
        }

        console.log(`Finished.`);
        console.log(`Active Hosts: ${activeCount}`);
        console.log(`Total Storage (Bytes): ${totalStorage.toString()}`);
        console.log(`Total Storage (PB): ${Number(totalStorage) / 1e15}`);

    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
