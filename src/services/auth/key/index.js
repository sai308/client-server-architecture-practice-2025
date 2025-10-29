const { randomBytes } = require('node:crypto');

/**
 * @implements {Services.ApiKeyService}
 */
class ApiKeyService {
  /**
   * @type {Services.ApiKeyService['generateKeyValue']}
   */
  generateKeyValue(prefix = 'pk', version = 1) {
    const randomPart = randomBytes(32).toString('base64url');
    return `${prefix}.v${version}.${randomPart}`;
  }

  /**
   * @type {Services.ApiKeyService['createKey']}
   */
  createKey(ownerId) {
    return {
      key: this.generateKeyValue(),
      lastUsedAt: null,
      isActive: true,
      ownerId,
    };
  }
}

module.exports = { apiKeyService: new ApiKeyService() };
