const axios = require('axios');
const https = require('https');

async function testEndpoint(url) {
    const agent = new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true,
        family: 4
    });

    try {
        console.log(`Testing GET ${url}...`);
        // Don't follow redirects automatically to inspect them
        const res = await axios.get(url, {
            httpsAgent: agent,
            timeout: 5000,
            maxRedirects: 0,
            validateStatus: status => status >= 200 && status < 400
        });
        console.log(`SUCCESS [${res.status}]:`, JSON.stringify(res.data).substring(0, 100));
        if (res.headers.location) console.log("Redirect Location:", res.headers.location);
        return true;
    } catch (e) {
        if (e.response && e.response.status >= 300 && e.response.status < 400) {
            console.log(`REDIRECT [${e.response.status}]: Location: ${e.response.headers.location}`);
            return true;
        }
        if (e.response) {
            console.log(`FAILED [${e.response.status}]: ${e.response.statusText}`);
        } else {
            console.log(`ERROR: ${e.message}`);
        }
        return false;
    }
}

async function run() {
    const baseURL = 'https://explorer.siagraph.info';
    await testEndpoint(`${baseURL}/api/search?q=550000`);
    await testEndpoint(`${baseURL}/search?q=550000`);
}

run();
