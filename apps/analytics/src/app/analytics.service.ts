import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Raw, Not, IsNull } from 'typeorm';
import { Host, Block, HostMetric } from 'database';
import { SiaClient } from 'sia-client';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(Host) private readonly hostRepo: Repository<Host>,
        @InjectRepository(Block) private readonly blockRepo: Repository<Block>,
        @InjectRepository(HostMetric) private readonly metricRepo: Repository<HostMetric>,
        private readonly siaClient: SiaClient,
    ) {
        // Analytics Service Initialized
    }

    async getNetworkStats() {
        // 1. Total Hosts (all scanned hosts in DB)
        const totalHosts = await this.hostRepo.count();

        // 2. Active Hosts (scored hosts = accepting contracts + recently active)
        // IMPORTANT: Use same definition as worker filter (score IS NOT NULL)
        // Previously used lastSeen > 48h which included hosts without scores (causing count mismatch)
        const activeHosts = await this.hostRepo.count({
            where: {
                score: Not(IsNull())
            }
        });

        // 3. Fetch Network Metrics from API (storage info only)
        let total = 0;
        let remaining = 0;
        let used = 0;
        let avgStoragePrice = 0;

        try {
            const apiMetrics = await this.siaClient.getNetworkMetrics();
            console.log('DEBUG: API Metrics Response:', JSON.stringify(apiMetrics));

            // NOTE: We ignore apiMetrics.activeHosts and use DB count instead
            total = Number(apiMetrics.totalStorage || apiMetrics.totalstorage || 0);
            remaining = Number(apiMetrics.remainingStorage || apiMetrics.remainingstorage || 0);
            used = total - remaining;

            // Try getting price from API
            avgStoragePrice = Number(apiMetrics.avgStoragePrice || apiMetrics.storageprice || 0);

            console.log(`DEBUG: Storage Calc: Total=${total}, Remaining=${remaining}, Used=${used}`);

            if (remaining === 0 && total > 0) {
                console.warn('WARNING: Remaining storage is 0 while Total is > 0. API mismatch suspected.');
            }
        } catch (error) {
            console.error('Failed to fetch network metrics from Siagraph API', error);
        }

        // If API price is 0, calculate from local DB (last 24h)
        if (avgStoragePrice === 0) {
            try {
                const { avg } = await this.metricRepo
                    .createQueryBuilder('m')
                    .select('AVG(m.storagePrice)', 'avg')
                    .where('m.time > :time', { time: new Date(Date.now() - 24 * 60 * 60 * 1000) })
                    .andWhere('m.storagePrice > 0')
                    .getRawOne();

                avgStoragePrice = Number(avg) || 0;
                console.log('Calculated avgStoragePrice from DB:', avgStoragePrice);
            } catch (e) {
                console.error('Failed to calc avgStoragePrice from DB', e);
            }
        }

        // 3. Block Tip
        const tip = await this.blockRepo.findOne({
            order: { height: 'DESC' },
            where: {}
        });

        return {
            totalHosts,      // All scanned hosts in DB
            activeHosts,     // Hosts active in last 48 hours
            usedStorage: used.toString(),
            totalStorage: total.toString(),
            avgStoragePrice,
            blockHeight: tip?.height || 0,
            lastBlockTime: tip?.timestamp
        };
    }

    async getTopHosts(limit: number = 50) {
        // Only return hosts seen in the last 24 hours
        return this.hostRepo.find({
            where: {
                // TypeORM doesn't support simple relative time in find options easily without Raw
                // We'll use Raw for Postgres interval
                lastSeen: Raw((alias) => `${alias} > NOW() - INTERVAL '24 hours'`)
            },
            order: { score: 'DESC' },
            take: limit
        });
    }

    async getNetworkHistory(period: '24h' | '30d' = '24h') {
        try {
            const interval = period === '24h' ? '1 hour' : '1 day';
            const limitTimestamp = period === '24h'
                ? new Date(Date.now() - 24 * 60 * 60 * 1000)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            // 1. Host Metrics History (Storage & Active Hosts)
            // Query: Aggregate per host per bucket (avg), then sum up for the bucket total
            // FIX: Join with hosts table to ensure we ONLY count currently active hosts (lastSeen > 24h ago).
            // Otherwise, we count all 68k historical hosts that might have stale metrics.
            const metricsQuery = `
                SELECT 
                    bucket_inner as bucket,
                    COUNT(DISTINCT sub."hostPublicKey") as "activeHosts",
                    SUM("avg_storage") as "totalStorage",
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "avg_price") as "storagePrice"
                FROM (
                    SELECT 
                        date_trunc('${period === '24h' ? 'hour' : 'day'}', m."time") as bucket_inner,
                        m."hostPublicKey",
                        AVG(m."remainingStorage") as avg_storage,
                        AVG(m."storagePrice") as avg_price
                    FROM host_metrics m
                    INNER JOIN hosts h ON m."hostPublicKey" = h."publicKey"
                    WHERE m."time" > $1
                    AND h."lastSeen" > NOW() - INTERVAL '24 hours' 
                    AND m."storagePrice" > 0
                    GROUP BY 1, 2
                ) sub
                GROUP BY 1
                ORDER BY 1 ASC
            `;

            const metricsData = await this.metricRepo.query(metricsQuery, [limitTimestamp]);

            // 2. Transaction Volume History
            const txQuery = `
                SELECT 
                    date_trunc('${period === '24h' ? 'hour' : 'day'}', "timestamp") as bucket,
                    SUM("transactionCount") as "transactionVolume"
                FROM blocks
                WHERE "timestamp" > $1
                GROUP BY 1
                ORDER BY 1 ASC
            `;

            const txData = await this.blockRepo.query(txQuery, [limitTimestamp]);

            // 3. Merge Data
            // Create a map of timestamps to ensure alignment (optional, but good for charts)
            // For simplicity, we just return the raw arrays and let frontend handle alignment or map them here.
            // Let's formatting them nicely for the frontend.

            return {
                metrics: metricsData.map(m => ({
                    timestamp: m.bucket,
                    activeHosts: Number(m.activeHosts) || 0,
                    totalStorage: m.totalStorage,
                    storagePrice: Number(m.storagePrice) || 0 // Convert to number
                })),
                transactions: txData.map(t => ({
                    timestamp: t.bucket,
                    transactionVolume: Number(t.transactionVolume) || 0
                }))
            };
        } catch (error) {
            console.error('ERROR in getNetworkHistory:', error);
            throw error;
        }
    }

    async getHostHistory(publicKey: string) {
        return this.metricRepo.find({
            where: { hostPublicKey: publicKey },
            order: { time: 'ASC' },
            take: 100 // Limit history points
        });
    }
}
