const { logger } = require('@/logger');

const { resourcesRepository } = require('@/repositories/resources');
const { cacheService } = require('@/services/cache');

/**
 * @typedef {{
 *   search?: string,
 *   page?: number,
 *   limit?: number
 * }} QueryParams
 */

/**
 * @typedef {ReturnType<Repositories.ResourcesRepository['getPaginatedList']> & QueryParams} ResourcesListResult
 */

/**
 * @param {QueryParams & {latest?: boolean}} params
 *
 * @returns {Promise<ResourcesListResult>}
 */
module.exports.queryResourcesList = async (params) => {
  const { search, page, limit, latest } = params;

  if (latest) {
    return Object.assign(
      await resourcesRepository.getPaginatedList(search, page, limit),
      { queryParams: { ...params } }
    );
  }

  const cacheKey = cacheService.buildCacheKey('resourcesList', params);

  const cachedRecord = /**
   * @type {ResourcesListResult | null}
   */ (await cacheService.getCache(cacheKey));

  if (cachedRecord) {
    return cachedRecord;
  }

  const actualData = await resourcesRepository.getPaginatedList(
    search,
    page,
    limit
  );

  // Cache for 5 minutes, side effect
  cacheService.saveCache(cacheKey, actualData, 300).catch((err) => {
    logger.warn(`Failed to cache resources list: ${err.message}`);
  });

  return actualData;
};
