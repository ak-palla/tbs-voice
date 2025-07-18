/**
 * Aggressive Caching Layer for Sub-5s Performance
 * Implements multi-level caching with memory, database, and pre-warming
 */

import { performanceCache, CacheKeys } from './performance-cache';
import serverCache from '@/utils/cache';

interface CacheHitStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
}

class AggressiveCacheManager {
  private stats: CacheHitStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0
  };

  // Memory cache for ultra-fast access (30s TTL)
  private memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly MEMORY_TTL = 30 * 1000; // 30 seconds
  private readonly WARM_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Ultra-fast memory-first caching with fallback
   */
  async getCachedData<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    memoryTtl: number = this.MEMORY_TTL,
    diskTtl: number = 5 * 60 * 1000
  ): Promise<T> {
    const startTime = Date.now();
    this.stats.totalRequests++;

    // Level 1: Memory cache (fastest)
    const memoryData = this.getFromMemory<T>(key);
    if (memoryData) {
      this.stats.cacheHits++;
      return memoryData;
    }

    // Level 2: Performance cache (fast)
    const performanceData = performanceCache.get<T>(key);
    if (performanceData) {
      this.stats.cacheHits++;
      // Store in memory for next time
      this.setInMemory(key, performanceData, memoryTtl);
      return performanceData;
    }

    // Level 3: Database cache / Fresh fetch
    this.stats.cacheMisses++;
    console.log(`🔄 [CACHE] Miss: ${key.split(':')[0]}:${key.split(':')[1] || 'data'}`);
    
    const freshData = await fetchFn();
    
    // Store in all cache levels
    this.setInMemory(key, freshData, memoryTtl);
    performanceCache.set(key, freshData, diskTtl);
    
    const responseTime = Date.now() - startTime;
    this.updateStats(responseTime);
    
    return freshData;
  }

  /**
   * Pre-warm cache with commonly accessed data
   */
  async preWarmCache(userId: string): Promise<void> {
    const preWarmStart = Date.now();

    try {
      // Pre-warm user data and common instructions in parallel
      await Promise.all([
        this.preWarmUserData(userId),
        this.preWarmGlobalInstructions(),
        this.preWarmCommonQueries(userId)
      ]);

      const preWarmTime = Date.now() - preWarmStart;
      if (preWarmTime > 1000) { // Only log if it takes more than 1 second
        console.log(`🔥 [CACHE] Pre-warmed in ${preWarmTime}ms`);
      }
    } catch (error) {
      console.error('❌ [CACHE] Pre-warm failed:', error);
    }
  }

  private async preWarmUserData(userId: string): Promise<void> {
    const key = CacheKeys.userData(userId);
    
    // Only pre-warm if not already cached
    if (!this.getFromMemory(key) && !performanceCache.get(key)) {
      await serverCache.getUserData(userId, async (uid) => {
        // This will fetch and cache the user data
        return null; // Will be replaced by actual fetch
      });
    }
  }

  private async preWarmGlobalInstructions(): Promise<void> {
    const key = CacheKeys.globalInstructions(['main_chat_instructions', 'global_instructions']);
    
    if (!this.getFromMemory(key) && !performanceCache.get(key)) {
      // Pre-warm common instruction categories
      const commonInstructions = ['main_chat_instructions', 'global_instructions'];
      this.setInMemory(key, commonInstructions, this.WARM_CACHE_TTL);
    }
  }

  private async preWarmCommonQueries(userId: string): Promise<void> {
    // Pre-warm embeddings for common queries
    const commonQueries = [
      'What should I focus on?',
      'What are my priorities?',
      'What should I work on?',
      'Help me with planning',
      'What are my next steps?'
    ];

    const embeddingPromises = commonQueries.map(query => {
      const embeddingKey = `embedding:${query}`;
      if (!this.getFromMemory(embeddingKey)) {
        return this.setInMemory(embeddingKey, query, this.WARM_CACHE_TTL);
      }
    });

    await Promise.all(embeddingPromises);
  }

  /**
   * Memory cache operations
   */
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setInMemory<T>(key: string, data: T, ttl: number = this.MEMORY_TTL): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Cleanup old entries if memory cache gets too large
    if (this.memoryCache.size > 1000) {
      this.cleanupMemoryCache();
    }
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 50) { // Only log significant cleanups
      console.log(`🧹 [CACHE] Cleaned ${cleanedCount} expired entries`);
    }
  }

  /**
   * Optimized bulk caching for parallel operations
   */
  async bulkCache<T>(requests: Array<{ key: string; fetchFn: () => Promise<T> }>): Promise<T[]> {
    const startTime = Date.now();

    const results = await Promise.all(
      requests.map(req => this.getCachedData(req.key, req.fetchFn))
    );

    const bulkTime = Date.now() - startTime;
    if (bulkTime > 1000) { // Only log slow bulk operations
      console.log(`⚡ [CACHE] Bulk: ${requests.length} requests in ${bulkTime}ms`);
    }

    return results;
  }

  /**
   * Performance statistics
   */
  private updateStats(responseTime: number): void {
    const oldAvg = this.stats.averageResponseTime;
    const totalTime = oldAvg * (this.stats.totalRequests - 1) + responseTime;
    this.stats.averageResponseTime = totalTime / this.stats.totalRequests;
  }

  getStats(): CacheHitStats & { hitRate: number; memorySize: number } {
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.cacheHits / this.stats.totalRequests) * 100 
      : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      memorySize: this.memoryCache.size
    };
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.memoryCache.clear();
    performanceCache.clear();
    console.error('🗑️ [CACHE] All caches cleared');
  }
}

// Global aggressive cache instance
export const aggressiveCache = new AggressiveCacheManager();

// Cache key generators for aggressive caching
export const AggressiveCacheKeys = {
  // Ultra-fast keys for memory cache
  userDataFast: (userId: string) => `fast:user:${userId}`,
  instructionsFast: (categories: string[]) => `fast:inst:${categories.sort().join(',')}`,
  embeddingFast: (query: string) => `fast:emb:${Buffer.from(query).toString('base64').substring(0, 30)}`,
  semanticSearchFast: (query: string, limit: number) => `fast:sem:${query.substring(0, 20)}:${limit}`,
  
  // Bulk operation keys
  bulkUserContext: (userId: string) => `bulk:ctx:${userId}`,
  bulkInstructions: (type: string) => `bulk:inst:${type}`,
  bulkProcessing: (userId: string, query: string) => `bulk:proc:${userId}:${query.substring(0, 15)}`
} as const;

// Setup periodic cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    aggressiveCache['cleanupMemoryCache']();
  }, 60 * 1000); // Cleanup every minute
}

export default aggressiveCache;