const https = require('https');

function get(url) {
    return new Promise((resolve) => {
        https.get(url, { headers: { 'User-Agent': 'NodeJS-Client' } }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    // SiaCentral usually returns { message: "...", hosts: [...] } or just [...]
                    console.log("Root content keys:", Object.keys(json));

                    let hosts = [];
                    if (Array.isArray(json)) hosts = json;
                    else if (json.hosts) hosts = json.hosts;

                    if (hosts.length > 0) {
                        console.log(`Found ${hosts.length} hosts.`);
                        const first = hosts[0];
                        console.log("Sample Host Keys:", Object.keys(first));
                        // Check for settings
                        const s = first.settings || {};
                        console.log("Settings Sample:", JSON.stringify(s, null, 2));
                    } else {
                        console.log("No hosts found in response");
                    }
                } catch (e) {
                    console.log("Parse Error:", e.message);
                }
                resolve();
            });
        }).on('error', (e) => {
            console.log(`Error: ${e.message}`);
            resolve();
        });
    });
}

async function run() {
    await get('https://api.siacentral.com/v2/hosts');
}

run();
