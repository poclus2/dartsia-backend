const https = require('https');

function post(url, body) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(body))
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    console.log(`Status: ${res.statusCode}`);
                    if (res.statusCode === 200) {
                        const json = JSON.parse(data);
                        if (Array.isArray(json) && json.length > 0) {
                            const s = json[0].settings || {};
                            console.log("- storageprice:", s.storageprice);
                            console.log("- totalstorage:", s.totalstorage);
                        } else {
                            console.log("Empty array or invalid JSON");
                        }
                    } else {
                        console.log("Body:", data.substring(0, 200));
                    }
                    resolve();
                } catch (e) {
                    console.log("Error parsing:", e.message);
                    resolve();
                }
            });
        });

        req.on('error', (e) => {
            console.log("Req Error:", e.message);
            resolve();
        });
        req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    const domain = 'https://explorer.siagraph.info';
    console.log(`Checking ${domain}/api/hosts (POST)...`);
    await post(`${domain}/api/hosts?limit=5&offset=0`, {});
}

run();
