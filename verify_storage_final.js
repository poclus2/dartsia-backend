const https = require('https');

function fetchUrl(url, body = {}) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const options = {
            method: 'POST',
            hostname: u.hostname,
            path: `${u.pathname}${u.search}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`Invalid JSON: ${e.message}`));
                    }
                } else {
                    reject(new Error(`Status ${res.statusCode}`));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(20000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.write(JSON.stringify(body));
        req.end();
    });
}

const API = 'https://explorer.siagraph.info';

async function run() {
    try {
        let totalStorage = 0n;
        let activeCount = 0;
        let loops = 0;
        let offset = 0;
        const limit = 1000;

        console.log('Starting fetch...');

        while (true) {
            const batch = await fetchUrl(`${API}/api/hosts?limit=${limit}&offset=${offset}`);
            if (!batch || batch.length === 0) break;

            const now = Date.now();
            const OneDay = 24 * 60 * 60 * 1000;

            for (const h of batch) {
                // Check Active (lastScanSuccessful or similar check)
                // Siagraph UI likely filters by country or score too, but raw storage should be basic active check.
                let lastSeen = 0;
                // Prefer lastScanSuccessful if available and strictly recent
                const ls = h.lastScanSuccessful || h.lastSeen;
                if (ls) {
                    lastSeen = new Date(ls).getTime();
                }

                // Relaxed filter: 48 hours to be safe? Or strict 24h?
                // Let's stick to 24h for now.
                if (now - lastSeen < OneDay) {
                    activeCount++;
                    if (h.settings && h.settings.totalstorage) {
                        totalStorage += BigInt(h.settings.totalstorage);
                    }
                }
            }

            offset += limit;
            loops++;
            if (loops % 10 === 0) console.log(`Processed ${offset} hosts...`);
            if (loops > 200) break; // Safety
        }

        console.log(`Active Hosts (24h): ${activeCount}`);
        console.log(`Total Storage (Bytes): ${totalStorage.toString()}`);
        console.log(`Total Storage (PB): ${Number(totalStorage) / 1e15}`);

    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
