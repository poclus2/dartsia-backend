import { Injectable, Inject } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Host } from 'database';

@Injectable()
export class HostService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @InjectRepository(Host) private hostRepository: Repository<Host>
    ) { }

    async getHosts(): Promise<Host[]> {
        const cacheKey = 'hosts_list_db';
        const cached = await this.cacheManager.get<Host[]>(cacheKey);
        if (cached) return cached;

        const hosts = await this.hostRepository.find({
            order: { score: 'DESC' }, // Show best hosts first
            take: 1000
        });

        await this.cacheManager.set(cacheKey, hosts, 10000); // 10s TTL
        return hosts;
    }
}
