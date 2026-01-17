const axios = require('axios');
const https = require('https');

// The public key we are looking for
const targetPubKeyFragment = '397e939ab8f06ead2a913196996bafc55c0e46b39828dcb4ebb07e1bb76a13db';

async function run() {
    const agent = new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true,
        family: 4
    });

    const axiosInstance = axios.create({
        baseURL: 'https://explorer.siagraph.info',
        httpsAgent: agent,
        timeout: 30000
    });

    let offset = 0;
    const limit = 500; // efficient scanning
    let found = false;
    let maxPages = 20; // Check first 10k hosts

    console.log(`Scanning for host containing key: ${targetPubKeyFragment}`);

    while (maxPages > 0 && !found) {
        try {
            console.log(`Fetching offset ${offset}...`);
            const res = await axiosInstance.post(`/api/hosts?limit=${limit}&offset=${offset}`, {});
            const hosts = res.data;

            if (!Array.isArray(hosts) || hosts.length === 0) {
                console.log("No more hosts.");
                break;
            }

            const match = hosts.find(h => h.publicKey && h.publicKey.includes(targetPubKeyFragment));
            if (match) {
                console.log("\n!!! HOST FOUND !!!");
                console.log(JSON.stringify(match, null, 2));

                // Inspect specific fields for debugging
                if (match.v2Settings) {
                    console.log("\n>>> v2Settings is PRESENT in API response.");
                } else {
                    console.log("\n>>> v2Settings is MISSING in API response.");
                }
                found = true;
            }

            offset += limit;
            maxPages--;

            // tiny delay
            await new Promise(r => setTimeout(r, 500));

        } catch (e) {
            console.error(`Error at offset ${offset}:`, e.message);
            // Retry once? No, just skip or break
            break;
        }
    }

    if (!found) {
        console.log("Host not found in checked pages.");
    }
}

run();
