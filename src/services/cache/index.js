const { env } = require('@/config');
const { logger } = require('@/logger');

const { CacheService } = require('./super');

logger.debug(
  `[CacheService]: Cache is ${env.DISABLE_CACHE ? 'DISABLED' : 'ENABLED'}`
);

const cacheService = new CacheService({
  cacheAdapter: require('@/adapters/redis').$db,
  disableCache: env.DISABLE_CACHE,
});

if (!env.DISABLE_CACHE) {
  cacheService
    .invalidateCache()
    .then((affected) => {
      logger.debug(
        `[CacheService]: All cache entries invalidated on startup. Affected keys: ${affected}`
      );
    })
    .catch((error) => {
      logger.debug(
        error,
        '[CacheService]: Error invalidating cache on startup'
      );
    });
}

module.exports = {
  cacheService,
};
