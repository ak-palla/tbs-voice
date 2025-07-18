/**
 * Performance Cache Layer for Chatbot
 * Implements Redis-like caching with TTL for user data and instructions
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class PerformanceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const performanceCache = new PerformanceCache();

// Cache key generators
export const CacheKeys = {
  userData: (userId: string) => `user_data:${userId}`,
  globalInstructions: (categories?: string[]) => 
    `global_instructions:${categories ? categories.sort().join(',') : 'all'}`,
  userContext: (userId: string) => `user_context:${userId}`,
  innovationInstances: (userId: string) => `innovation_instances:${userId}`,
  vectorSearch: (query: string, type: 'history' | 'instructions') => 
    `vector_search:${type}:${Buffer.from(query).toString('base64').substring(0, 50)}`
} as const;

// Setup periodic cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    performanceCache.cleanup();
  }, 10 * 60 * 1000); // Cleanup every 10 minutes
}