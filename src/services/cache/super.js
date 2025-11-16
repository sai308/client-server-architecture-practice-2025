/**
 * @implements {Services.Cache}
 */
class CacheService {
  /**
   * @type {Services.CacheServiceDeps}
   */
  #ctx;

  /**
   * @type {Services.CacheServiceDeps}
   */
  constructor({ cacheAdapter, disableCache = false }) {
    this.#ctx = { cacheAdapter, disableCache };
  }
  /**
   * @type {Services.Cache['getCache']}
   */
  async getCache(key) {
    if (this.#ctx.disableCache) {
      return null;
    }

    const cacheRecord = await this.#ctx.cacheAdapter.get(key);

    return this.#deserialize(cacheRecord);
  }

  /**
   * @type {Services.Cache['saveCache']}
   */
  async saveCache(key, value, ttlSeconds) {
    if (this.#ctx.disableCache) {
      return;
    }

    const cacheString = this.#serialize(value);

    await this.#ctx.cacheAdapter.setex(key, ttlSeconds, cacheString);
  }

  /**
   * @type {Services.Cache['clearCache']}
   */
  async clearCache(key) {
    if (this.#ctx.disableCache) {
      return;
    }

    return Boolean(await this.#ctx.cacheAdapter.del(key));
  }

  /**
   * Clears ALL cache entries
   * @type {Services.Cache['invalidateCache']}
   */
  async invalidateCache() {
    const pattern = 'cache:*';
    const stream = this.#ctx.cacheAdapter.scanStream({
      match: pattern,
      count: 100,
    });

    let affected = 0;

    return new Promise((resolve, reject) => {
      stream.on('data', (keys) => {
        if (keys.length) {
          const pipeline = this.#ctx.cacheAdapter.pipeline();

          keys.forEach((key) => {
            pipeline.del(key);
            affected += 1;
          });

          pipeline.exec().catch(reject);
        }
      });

      stream.on('end', () => resolve(affected));
      stream.on('error', (err) => reject(err));
    });
  }

  /**
   * @type {Services.Cache['buildCacheKey']}
   */
  buildCacheKey(entity, params = {}) {
    const normalizedParams = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&');

    return `cache:${entity}${normalizedParams ? `?${normalizedParams}` : '-'}`;
  }

  /**
   * Serialize cache record to string
   * @param {object} cacheRecord
   * @returns {string}
   */
  #serialize(cacheRecord) {
    return JSON.stringify(cacheRecord);
  }

  /**
   * Deserialize cache string to object
   * @param {string} cacheString
   * @returns {object}
   */
  #deserialize(cacheString) {
    try {
      return JSON.parse(cacheString);
    } catch (e) {
      return null;
    }
  }
}

module.exports = { CacheService };
