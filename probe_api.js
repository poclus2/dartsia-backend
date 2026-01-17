const https = require('https');

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`[${res.statusCode}] ${url}`);
                if (res.statusCode === 200) console.log("Success!");
                resolve();
            });
        }).on('error', (e) => {
            console.log(`Error ${url}: ${e.message}`);
            resolve();
        });
    });
}

async function run() {
    await get('https://api.sia.tech/hosts');
    await get('https://api.sia.tech/api/hosts');
    await get('https://siastats.info/dbs/hosts.json');
    await get('https://api.siacentral.com/v2/hosts');
}

run();
