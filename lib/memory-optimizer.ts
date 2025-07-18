/**
 * Memory Optimizer for Reducing Overhead
 * Implements object pooling and efficient memory management
 */

class MemoryOptimizer {
  private objectPools = new Map<string, any[]>();
  private readonly MAX_POOL_SIZE = 50;

  /**
   * Object pooling for frequently created objects
   */
  getPooledObject<T>(type: string, factory: () => T): T {
    const pool = this.objectPools.get(type) || [];
    
    if (pool.length > 0) {
      const obj = pool.pop()!;
      // Reset object properties
      this.resetObject(obj);
      return obj;
    }
    
    return factory();
  }

  returnToPool<T>(type: string, obj: T): void {
    const pool = this.objectPools.get(type) || [];
    
    if (pool.length < this.MAX_POOL_SIZE) {
      pool.push(obj);
      this.objectPools.set(type, pool);
    }
  }

  private resetObject(obj: any): void {
    // Clear common properties without recreating the object
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        if (Array.isArray(obj[key])) {
          obj[key].length = 0;
        } else if (typeof obj[key] === 'string') {
          obj[key] = '';
        } else if (typeof obj[key] === 'number') {
          obj[key] = 0;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          obj[key] = {};
        }
      });
    }
  }

  /**
   * Efficient array operations
   */
  batchProcess<T, R>(items: T[], processor: (item: T) => R, batchSize: number = 10): R[] {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = batch.map(processor);
      results.push(...batchResults);
      
      // Allow event loop to process other tasks
      if (i > 0 && i % (batchSize * 4) === 0) {
        // Yield control occasionally for large datasets
        setImmediate?.(() => {});
      }
    }
    
    return results;
  }

  /**
   * Memory-efficient string operations
   */
  efficientStringConcat(strings: string[]): string {
    // Use array join instead of concatenation for better performance
    return strings.filter(s => s && s.length > 0).join('');
  }

  efficientStringTruncate(str: string, maxLength: number): string {
    return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
  }

  /**
   * Garbage collection hints (Node.js only)
   */
  suggestGC(): void {
    if (typeof global !== 'undefined' && global.gc) {
      // Force garbage collection if available
      global.gc();
      console.log('🧹 [MEMORY] GC suggested');
    }
  }

  /**
   * Memory usage monitoring
   */
  getMemoryUsage(): { heapUsed: number; heapTotal: number; external: number; rss: number } | null {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
        external: Math.round(usage.external / 1024 / 1024), // MB
        rss: Math.round(usage.rss / 1024 / 1024) // MB
      };
    }
    return null;
  }

  logMemoryUsage(label: string): void {
    const usage = this.getMemoryUsage();
    if (usage && (label === 'CRITICAL' || usage.heapUsed > 500)) { // Only log if critical usage
      console.warn(`🧠 [MEMORY] ${usage.heapUsed}MB heap (${label})`);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.objectPools.clear();
    console.error('🧹 [MEMORY] Memory optimizer cleanup completed');
  }
}

// Global memory optimizer instance
export const memoryOptimizer = new MemoryOptimizer();

// Common object factories for pooling
export const ObjectFactories = {
  createTextProcessor: () => ({
    text: '',
    processed: false,
    metadata: {},
    chunks: [] as string[]
  }),
  
  createCacheEntry: () => ({
    key: '',
    data: null,
    timestamp: 0,
    ttl: 0,
    hits: 0
  }),
  
  createResponseBuilder: () => ({
    content: '',
    metadata: {},
    timing: {
      start: 0,
      end: 0,
      phases: [] as any[]
    }
  })
} as const;

// Setup periodic memory monitoring (only for critical usage)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const usage = memoryOptimizer.getMemoryUsage();
    if (usage && usage.heapUsed > 600) { // Only monitor if > 600MB (critical)
      memoryOptimizer.logMemoryUsage('CRITICAL');
      memoryOptimizer.suggestGC();
    }
  }, 15 * 60 * 1000); // Every 15 minutes
}

export default memoryOptimizer;