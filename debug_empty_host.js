const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/sia_nexus'
});

async function run() {
    try {
        await client.connect();

        // Look for the host from the screenshot
        const pubKeyFragment = '397e939ab8f06ead2a913196996bafc55c0e46b39828dcb4ebb07e1bb76a13db';

        const query = `
        SELECT "publicKey", "netAddress", "lastSeen", "score", "settings"
        FROM hosts 
        WHERE "publicKey" LIKE '%${pubKeyFragment}%'
    `;

        console.log(`Searching for host *${pubKeyFragment}...`);
        const res = await client.query(query);

        if (res.rows.length > 0) {
            const host = res.rows[0];
            console.log("FOUND!");
            console.log("NetAddress (Col):", host.netAddress);
            console.log("Settings.netaddress:", host.settings?.netaddress);
            console.log("Settings.totalstorage:", host.settings?.totalstorage);
            console.log("Settings.remainingstorage:", host.settings?.remainingstorage);
            console.log("Settings.storageprice:", host.settings?.storageprice);
            console.log("Settings.minstorageprice:", host.settings?.minstorageprice);
            console.log("Whole Settings Keys:", Object.keys(host.settings || {}));
        } else {
            console.log("Host NOT FOUND.");
        }

        await client.end();
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
