const https = require('https');

function request(url, method, body) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: method,
            rejectUnauthorized: false, // Allow self-signed or bad certs
            headers: {
                'User-Agent': 'Sia-Agent',
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`[${method}] ${url} -> Status: ${res.statusCode}`);
                try {
                    if (res.statusCode === 200) {
                        const json = JSON.parse(data);
                        if (Array.isArray(json) && json.length > 0) {
                            const s = json[0].settings || {};
                            console.log("Sample Data:");
                            console.log("- storageprice:", s.storageprice);
                            console.log("- totalstorage:", s.totalstorage);
                        } else {
                            console.log("Empty array or invalid JSON");
                        }
                    }
                } catch (e) { console.log("Parse Error"); }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.log(`Error ${url}: ${e.message}`);
            resolve();
        });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    // Original env URL (POST)
    await request('https://explorer.siagraph.info/api/hosts?limit=5', 'POST', {});

    // Official API (GET)
    await request('https://api.sia.tech/hosts', 'GET', null);

    // SiaStats (GET)
    await request('https://siastats.info/dbs/hosts.json', 'GET', null);
}

run();
