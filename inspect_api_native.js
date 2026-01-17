
const https = require('https');

function fetch(url, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const opts = {
            method,
            headers: {
                'User-Agent': 'Sia-Agent',
                'Content-Type': 'application/json'
            },
            family: 4, // Force IPv4
            timeout: 10000
        };

        if (body) {
            opts.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = https.request(url, opts, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.log("Response not JSON:", data.substring(0, 100));
                    resolve({});
                }
            });
        });

        req.on('error', reject);

        if (body) req.write(body);
        req.end();
    });
}

async function run() {
    try {
        console.log("Fetching hosts...");
        const data = await fetch('https://explorer.siagraph.info/api/hosts?limit=5&offset=0', 'POST', JSON.stringify({}));

        if (Array.isArray(data) && data.length > 0) {
            const h = data[0];
            console.log("Settings Keys:", Object.keys(h.settings || {}));
            console.log("storageprice:", h.settings?.storageprice);
            console.log("totalstorage:", h.settings?.totalstorage);
            console.log("remainingstorage:", h.settings?.remainingstorage);
            // Print one price to see magnitude
            console.log("Raw Price Sample:", h.settings?.storageprice);
        } else {
            console.log("No data or invalid format", JSON.stringify(data).substring(0, 200));
        }

    } catch (e) {
        console.error(e);
    }
}

run();
