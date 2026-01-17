import { Injectable, Inject } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { SiaClient } from 'sia-client';
import { HostDto } from 'common';

@Injectable()
export class HostService {
    private siaClient: SiaClient;

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
        this.siaClient = new SiaClient();
    }

    async getHosts(): Promise<HostDto[]> {
        const cacheKey = 'hosts_list';
        const cached = await this.cacheManager.get<HostDto[]>(cacheKey);
        if (cached) return cached;

        const hosts = await this.siaClient.getHosts();
        await this.cacheManager.set(cacheKey, hosts, 10000); // 10s TTL
        return hosts;
    }
}
