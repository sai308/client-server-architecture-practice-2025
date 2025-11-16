declare namespace Services {
  type CacheServiceDeps = {
    cacheAdapter: (typeof import('@/adapters/redis'))['$db']; //CacheAdapter;
    disableCache?: boolean;
  };

  interface Cache {
    getCache(key: string): Promise<object>;
    saveCache(key: string, value: object, ttlSeconds?: number): Promise<void>;
    clearCache(key: string): Promise<boolean>;
    invalidateCache(): Promise<number>;
    buildCacheKey(entityName: string, params?: Record<string, unknown>): string;
  }
}
