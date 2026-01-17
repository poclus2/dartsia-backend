const { Queue } = require('bullmq');

async function run() {
    const blockQueue = new Queue('block-ingestion', {
        connection: {
            host: 'localhost',
            port: 6379
        }
    });

    console.log("Adding block-sync job...");
    await blockQueue.add('block-sync', {});
    console.log("Job added. Check worker logs.");

    // allow time to push
    await new Promise(r => setTimeout(r, 1000));
    process.exit(0);
}

run();
