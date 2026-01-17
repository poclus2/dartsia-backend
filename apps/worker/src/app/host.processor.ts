import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiaClient } from 'sia-client';
import { Host, HostMetric, SyncState } from 'database';

@Processor('ingestion')
@Injectable()
export class HostScanProcessor extends WorkerHost {
    private readonly logger = new Logger(HostScanProcessor.name);

    // Scoring Weights (Configurable)
    private readonly W_UPTIME = parseFloat(process.env.SCORE_WEIGHT_UPTIME || '0.4');
    private readonly W_PRICE = parseFloat(process.env.SCORE_WEIGHT_PRICE || '0.4');
    private readonly W_AGE = parseFloat(process.env.SCORE_WEIGHT_AGE || '0.2');

    private parseNumeric(val: any, defaultVal: number): number {
        if (val === undefined || val === null) return defaultVal;
        const parsed = parseFloat(val);
        return isNaN(parsed) ? defaultVal : parsed;
    }

    constructor(
        private readonly siaClient: SiaClient,
        @InjectRepository(Host)
        private readonly hostRepo: Repository<Host>,
        @InjectRepository(HostMetric)
        private readonly metricRepo: Repository<HostMetric>,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(`Processing job: ${job.name} (ID: ${job.id})`);
        if (job.name === 'host-sync') {
            await this.syncHosts();
        } else {
            this.logger.warn(`Unknown job name: ${job.name}`);
        }
    }

    private async syncHosts() {
        this.logger.log('Starting host sync & scoring...');
        let offset = 0;
        const limit = 100;
        let successCount = 0;
        let totalFetched = 0;

        while (true) {
            let hosts;
            let retries = 3;

            while (retries > 0) {
                try {
                    // Throttling: Delay 1s between batches to avoid overwhelming the server/socket
                    if (offset > 0) await new Promise(resolve => setTimeout(resolve, 1000));

                    this.logger.log(`Fetching hosts batch offset=${offset}...`);
                    hosts = await this.siaClient.getHosts(offset, limit);
                    break; // Success
                } catch (error) {
                    retries--;
                    this.logger.warn(`Failed to fetch hosts (offset=${offset}). Retries left: ${retries}. Error: ${error.message}`);
                    if (retries === 0) {
                        this.logger.error('Max retries reached for batch. Aborting sync.', error);
                        throw error;
                    }
                    // Wait before retry (exponential backoff: 2s, 4s, 8s)
                    const waitTime = 2000 * (3 - retries);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }

            if (hosts.length === 0) {
                break; // No more hosts
            }

            totalFetched += hosts.length;

            const now = new Date();

            for (const data of hosts) {
                // ... (processing logic remains the same) ...
                // Strict Validation: Skip if no public key
                if (!data.publicKey) {
                    this.logger.warn(`Skipping host with missing public key: ${JSON.stringify(data)}`);
                    continue;
                }

                // 1. Upsert Host Registry
                let host = await this.hostRepo.findOne({ where: { publicKey: data.publicKey } });
                if (!host) {
                    host = this.hostRepo.create({
                        publicKey: data.publicKey,
                        firstSeen: data.firstSeen ? new Date(data.firstSeen) : now,
                        // Fix: lastScanSuccessful is boolean. Use lastScan if true.
                        lastSeen: (data.lastScanSuccessful && data.lastScan) ? new Date(data.lastScan) : new Date(0)
                    });
                } else {
                    // Update lastSeen if API reports successful scan
                    if (data.lastScanSuccessful && data.lastScan) {
                        host.lastSeen = new Date(data.lastScan);
                    }
                }

                host.netAddress = data.netAddress || null;
                // host.lastSeen -- Handled above
                host.settings = data.settings || {};
                host.v2Settings = data.v2Settings || {}; // Save v2 settings
                host.countryCode = data.countryCode || 'XX';

                // 2. Derive Metrics & Calculate Score
                const totalUptime = this.parseNumeric(data.uptimeTotal, 0);
                const totalTime = this.parseNumeric(data.uptimeH, 1) || 1; // Prevent div by 0
                const normUptime = Math.min(totalUptime / totalTime, 1);

                // Price: Parsing Logic. Treat missing as 'expensive' (0 score) to penalize bad data
                // Handle casing fallback (storageprice vs storagePrice)
                // Also check v2Settings (snake_case typically)
                let rawStoragePrice = data.settings?.storageprice || data.settings?.storagePrice;

                // Try v2Settings (RHP3 structure often uses nested prices or snake_case)
                if (data.v2Settings) {
                    // Common rhp3 keys: prices.storage_price or similar
                    // We check shallow keys first just in case
                    if (data.v2Settings.storage_price) rawStoragePrice = data.v2Settings.storage_price;
                    else if (data.v2Settings.prices?.storage_price) rawStoragePrice = data.v2Settings.prices.storage_price;
                    else if (data.v2Settings.storagePrice) rawStoragePrice = data.v2Settings.storagePrice; // camelCase
                }

                const storagePrice = this.parseNumeric(rawStoragePrice, NaN); // Use NaN to detect missing

                // If critical metrics are missing, we skip SCORING and SNAPSHOT, but keep the Registry update (seen status)
                // Filter: Also skip if price is 0 (invalid data) to avoid messing up average metrics
                if (isNaN(storagePrice) || storagePrice <= 0) {
                    await this.hostRepo.save(host); // Save "Seen" status
                    continue; // Skip metrics
                }

                const normPrice = Math.max(0, Math.min(1, 1000 / (storagePrice + 1)));

                const firstSeenDate = host.firstSeen || now;
                const ageMs = now.getTime() - firstSeenDate.getTime();
                const normAge = Math.min(ageMs / (365 * 24 * 3600 * 1000), 1);

                // Score Formula
                host.score = (normUptime * this.W_UPTIME) + (normPrice * this.W_PRICE) + (normAge * this.W_AGE);
                host.scoreUpdatedAt = now;

                await this.hostRepo.save(host);

                // 3. Insert Metric Snapshot (Partitioned)
                // Filter: Only insert metrics for hosts seen in the last 24 hours.
                const isOnline = (now.getTime() - host.lastSeen.getTime()) < 24 * 60 * 60 * 1000;

                if (isOnline) {
                    let remainingStorage = data.settings?.remainingstorage;
                    if (data.v2Settings) {
                        if (data.v2Settings.remaining_storage) remainingStorage = data.v2Settings.remaining_storage;
                        else if (data.v2Settings.remainingStorage) remainingStorage = data.v2Settings.remainingStorage; // camelCase
                    }

                    const metric = this.metricRepo.create({
                        time: now,
                        hostPublicKey: host.publicKey,
                        storagePrice: storagePrice,
                        uploadPrice: this.parseNumeric(data.settings?.uploadprice, 0),
                        downloadPrice: this.parseNumeric(data.settings?.downloadprice, 0),
                        remainingStorage: remainingStorage || '0',
                        uptimeTotal: totalUptime.toString(),
                        uptimeH: totalTime.toString()
                    });
                    await this.metricRepo.save(metric);
                }
                successCount++;
            }

            offset += limit;

            // Safety break just in case of infinite loop
            if (offset > 100000) {
                this.logger.warn('Max host limit reached, stopping sync.');
                break;
            }
        }

        this.logger.log(`Synced ${successCount}/${totalFetched} hosts.`);
    }
}
