/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("reflect-metadata");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(6);
const typeorm_1 = __webpack_require__(8);
const analytics_controller_1 = __webpack_require__(14);
const analytics_service_1 = __webpack_require__(15);
const sia_client_1 = __webpack_require__(16);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            database_1.DatabaseModule,
            typeorm_1.TypeOrmModule.forFeature([database_1.Host, database_1.HostMetric, database_1.Block]),
        ],
        controllers: [analytics_controller_1.AnalyticsController],
        providers: [analytics_service_1.AnalyticsService, sia_client_1.SiaClient],
    })
], AppModule);


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(5);
tslib_1.__exportStar(__webpack_require__(7), exports);
tslib_1.__exportStar(__webpack_require__(9), exports);
tslib_1.__exportStar(__webpack_require__(11), exports);
tslib_1.__exportStar(__webpack_require__(12), exports);
tslib_1.__exportStar(__webpack_require__(13), exports);


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(8);
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => ({
                    type: 'postgres',
                    url: process.env.DATABASE_URL,
                    autoLoadEntities: true,
                    synchronize: process.env.NODE_ENV !== 'production',
                }),
            }),
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], DatabaseModule);


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Block = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(10);
let Block = class Block {
};
exports.Block = Block;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    tslib_1.__metadata("design:type", Number)
], Block.prototype, "height", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    tslib_1.__metadata("design:type", String)
], Block.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Block.prototype, "timestamp", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    tslib_1.__metadata("design:type", Number)
], Block.prototype, "transactionCount", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    tslib_1.__metadata("design:type", Object)
], Block.prototype, "minerPayouts", void 0);
exports.Block = Block = tslib_1.__decorate([
    (0, typeorm_1.Entity)('blocks')
], Block);


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Host = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(10);
let Host = class Host {
};
exports.Host = Host;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    tslib_1.__metadata("design:type", String)
], Host.prototype, "publicKey", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Host.prototype, "netAddress", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Host.prototype, "firstSeen", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Host.prototype, "lastSeen", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    tslib_1.__metadata("design:type", Object)
], Host.prototype, "settings", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'char', length: 2, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Host.prototype, "countryCode", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', nullable: true }),
    tslib_1.__metadata("design:type", Number)
], Host.prototype, "score", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], Host.prototype, "scoreUpdatedAt", void 0);
exports.Host = Host = tslib_1.__decorate([
    (0, typeorm_1.Entity)('hosts')
], Host);


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HostMetric = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(10);
const host_entity_1 = __webpack_require__(11);
let HostMetric = class HostMetric {
};
exports.HostMetric = HostMetric;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'timestamptz' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], HostMetric.prototype, "time", void 0);
tslib_1.__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    tslib_1.__metadata("design:type", String)
], HostMetric.prototype, "hostPublicKey", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => host_entity_1.Host),
    (0, typeorm_1.JoinColumn)({ name: 'hostPublicKey' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof host_entity_1.Host !== "undefined" && host_entity_1.Host) === "function" ? _b : Object)
], HostMetric.prototype, "host", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', nullable: true }),
    tslib_1.__metadata("design:type", Number)
], HostMetric.prototype, "storagePrice", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', nullable: true }),
    tslib_1.__metadata("design:type", Number)
], HostMetric.prototype, "uploadPrice", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', nullable: true }),
    tslib_1.__metadata("design:type", Number)
], HostMetric.prototype, "downloadPrice", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    tslib_1.__metadata("design:type", String)
], HostMetric.prototype, "remainingStorage", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    tslib_1.__metadata("design:type", String)
], HostMetric.prototype, "uptimeTotal", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    tslib_1.__metadata("design:type", String)
], HostMetric.prototype, "uptimeH", void 0);
exports.HostMetric = HostMetric = tslib_1.__decorate([
    (0, typeorm_1.Entity)('host_metrics')
], HostMetric);


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SyncState = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(10);
let SyncState = class SyncState {
};
exports.SyncState = SyncState;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    tslib_1.__metadata("design:type", String)
], SyncState.prototype, "key", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    tslib_1.__metadata("design:type", Number)
], SyncState.prototype, "lastHeight", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], SyncState.prototype, "updatedAt", void 0);
exports.SyncState = SyncState = tslib_1.__decorate([
    (0, typeorm_1.Entity)('sync_state')
], SyncState);


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnalyticsController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const analytics_service_1 = __webpack_require__(15);
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    getNetworkStats() {
        return this.analyticsService.getNetworkStats();
    }
    getNetworkHistory(period) {
        return this.analyticsService.getNetworkHistory(period);
    }
    getTopHosts(limit) {
        return this.analyticsService.getTopHosts(limit || 50);
    }
    getHostHistory(pubkey) {
        return this.analyticsService.getHostHistory(pubkey);
    }
};
exports.AnalyticsController = AnalyticsController;
tslib_1.__decorate([
    (0, common_1.Get)('network'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getNetworkStats", null);
tslib_1.__decorate([
    (0, common_1.Get)('network/history'),
    tslib_1.__param(0, (0, common_1.Query)('period')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getNetworkHistory", null);
tslib_1.__decorate([
    (0, common_1.Get)('hosts/top'),
    tslib_1.__param(0, (0, common_1.Query)('limit')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number]),
    tslib_1.__metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getTopHosts", null);
tslib_1.__decorate([
    (0, common_1.Get)('hosts/:pubkey/history'),
    tslib_1.__param(0, (0, common_1.Param)('pubkey')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getHostHistory", null);
exports.AnalyticsController = AnalyticsController = tslib_1.__decorate([
    (0, common_1.Controller)('analytics'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof analytics_service_1.AnalyticsService !== "undefined" && analytics_service_1.AnalyticsService) === "function" ? _a : Object])
], AnalyticsController);


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnalyticsService = void 0;
const tslib_1 = __webpack_require__(5);
const sia_client_1 = __webpack_require__(16);
let AnalyticsService = class AnalyticsService {
    constructor(hostRepo, blockRepo, metricRepo, siaClient) {
        this.hostRepo = hostRepo;
        this.blockRepo = blockRepo;
        this.metricRepo = metricRepo;
        this.siaClient = siaClient;
    }
    async getNetworkStats() {
        // 1. Total Hosts (All known hosts) from DB
        const totalHosts = await this.hostRepo.count();
        // 2. Fetch Authoritative Network Metrics from Siagraph API
        // This provides the correct "Active Hosts" and "Total Storage" values
        let apiMetrics = { activeHosts: 0, totalStorage: '0' };
        try {
            apiMetrics = await this.siaClient.getNetworkMetrics();
        }
        catch (error) {
            console.error('Failed to fetch network metrics from Siagraph API', error);
        }
        // 3. Block Tip
        const tip = await this.blockRepo.findOne({
            order: { height: 'DESC' },
            where: {}
        });
        return {
            totalHosts,
            activeHosts: apiMetrics.activeHosts || 0,
            usedStorage: apiMetrics.totalStorage || '0', // Using global total storage as "Used Storage" per user requirement
            totalStorage: apiMetrics.totalStorage || '0', // Can be same or we can fetch capacity if available, for now mirroring
            blockHeight: tip?.height || 0,
            lastBlockTime: tip?.timestamp
        };
    }
    async getTopHosts(limit = 50) {
        return this.hostRepo.find({
            order: { score: 'DESC' },
            take: limit
        });
    }
    async getNetworkHistory(period = '24h') {
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
                    SUM("avg_storage") as "totalStorage"
                FROM (
                    SELECT 
                        date_trunc('${period === '24h' ? 'hour' : 'day'}', m."time") as bucket_inner,
                        m."hostPublicKey",
                        AVG(m."remainingStorage") as avg_storage
                    FROM host_metrics m
                    INNER JOIN hosts h ON m."hostPublicKey" = h."publicKey"
                    WHERE m."time" > $1
                    AND h."lastSeen" > NOW() - INTERVAL '24 hours' 
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
                    totalStorage: m.totalStorage // Postgres might return string, frontend handles it. But we can ensure string.
                })),
                transactions: txData.map(t => ({
                    timestamp: t.bucket,
                    transactionVolume: Number(t.transactionVolume) || 0
                }))
            };
        }
        catch (error) {
            console.error('ERROR in getNetworkHistory:', error);
            throw error;
        }
    }
    async getHostHistory(publicKey) {
        return this.metricRepo.find({
            where: { hostPublicKey: publicKey },
            order: { time: 'ASC' },
            take: 100 // Limit history points
        });
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = tslib_1.__decorate([
    Injectable(),
    tslib_1.__param(0, InjectRepository(Host)),
    tslib_1.__param(1, InjectRepository(Block)),
    tslib_1.__param(2, InjectRepository(HostMetric)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof Repository !== "undefined" && Repository) === "function" ? _a : Object, typeof (_b = typeof Repository !== "undefined" && Repository) === "function" ? _b : Object, typeof (_c = typeof Repository !== "undefined" && Repository) === "function" ? _c : Object, typeof (_d = typeof sia_client_1.SiaClient !== "undefined" && sia_client_1.SiaClient) === "function" ? _d : Object])
], AnalyticsService);


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(5);
tslib_1.__exportStar(__webpack_require__(17), exports);


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SiaClient = void 0;
const tslib_1 = __webpack_require__(5);
const axios_1 = tslib_1.__importDefault(__webpack_require__(18));
// Actually I don't know the exact path mapping yet. Usually @proj/lib.
// I'll check tsconfig.base.json later. For now I'll risk it or use relative if in same repo (but they are separate libs).
// Safest is to use the import path defined in tsconfig.base.json.
// The default is usually @<workspace-name>/<lib-name> or similar.
// I'll check tsconfig.base.json in next step if this fails or just check it now.
class SiaClient {
    constructor(baseURL) {
        const apiUrl = baseURL || process.env['SIA_EXPLORED_API'] || 'https://api.sia.tech';
        this.axios = axios_1.default.create({
            baseURL: apiUrl,
            timeout: 120000,
        });
    }
    async getTip() {
        // Explored API: GET /api/consensus/tip returns ChainIndex
        // ChainIndex has { height: number, id: string }
        const { data } = await this.axios.get('/api/consensus/tip');
        return data; // Return the ChainIndex directly
    }
    async getBlock(height) {
        // For now, if requesting tip height, just call getTip
        const tip = await this.getTip();
        if (tip.height === height) {
            return tip;
        }
        // For other heights, Explored doesn't provide easy lookup
        // This would require traversing the chain or using explorer endpoints
        throw new Error(`getBlock by height not implemented. Current tip: ${tip.height}`);
    }
    async getHosts(offset = 0, limit = 500, filters) {
        // Explored API: POST /api/hosts
        // Max limit is 500 per api/server.go
        const body = filters || {};
        try {
            const { data } = await this.axios.post(`/api/hosts?limit=${limit}&offset=${offset}`, body);
            return data;
        }
        catch (e) {
            throw e;
        }
    }
    async getTransaction(id) {
        // Explored API: GET /api/transactions/:id
        const { data } = await this.axios.get(`/api/transactions/${id}`);
        return data;
    }
    async getNetworkMetrics() {
        // Siagraph API: GET /api/metrics/host
        const { data } = await this.axios.get('/api/metrics/host');
        return data;
    }
}
exports.SiaClient = SiaClient;


/***/ }),
/* 18 */
/***/ ((module) => {

module.exports = require("axios");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(1);
const common_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const app_module_1 = __webpack_require__(4);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map