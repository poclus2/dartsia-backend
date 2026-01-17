const http = require('http');

function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error("Parse Error:", e.message, "Raw:", data);
                    resolve({});
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    console.log("Fetching CURRENT stats from http://localhost:3002/api/analytics/network ...");
    try {
        const data = await httpGet('http://localhost:3002/api/analytics/network');
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Request Error:", e.message);
    }
}

run();
