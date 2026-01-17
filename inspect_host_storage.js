
const https = require('https');

function fetch(url, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const opts = {
            method,
            headers: {
                'User-Agent': 'Sia-Agent',
                'Content-Type': 'application/json'
            },
            family: 4,
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
        const data = await fetch('https://explorer.siagraph.info/api/hosts?limit=10&offset=0', 'POST', JSON.stringify({}));

        if (Array.isArray(data) && data.length > 0) {
            data.slice(0, 3).forEach((h, i) => {
                console.log(`Host ${i}:`);
                console.log(`  Total: ${h.settings?.totalstorage}`);
                console.log(`  Remaining: ${h.settings?.remainingstorage}`);
            });
        } else {
            console.log("No data");
        }

    } catch (e) {
        console.error(e);
    }
}

run();
