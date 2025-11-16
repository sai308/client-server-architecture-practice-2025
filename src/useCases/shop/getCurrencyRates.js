const { logger } = require('@/logger');

const { currencyProvider } = require('@/providers/currencies');
const { cacheService } = require('@/services/cache');

/**
 * @description Use case to get currency rates, with caching.
 * @param {boolean} latest
 */
module.exports.queryCurrencyRates = async (latest) => {
  if (latest) {
    return await currencyProvider.getRates();
  }

  const cacheKey = cacheService.buildCacheKey('currencyRates');

  const cachedRecord = /**
   * @type {Providers.CurrencyRates[] | null}
   */ (await cacheService.getCache(cacheKey));

  if (cachedRecord) {
    return cachedRecord;
  }

  const actualData = await currencyProvider.getRates();

  // Cache for 5 minutes, side effect
  cacheService.saveCache(cacheKey, actualData, 600).catch((err) => {
    logger.warn(`Failed to cache currency rates: ${err.message}`);
  });

  return actualData;
};
