const { $db, $schemas } = require('@/adapters/postgres');
const { eq, sql } = require('drizzle-orm');

/**
 * @description A repository for managing auth sessions.
 * @implements {Repositories.ApiKeysRepository}
 */
class ApiKeysRepository {
  /**
   * Create a new ApiKey with the given data
   * @type {Repositories.ApiKeysRepository['create']}
   */
  async create(keyData) {
    const syncedTimestamp = new Date();

    const [newApiKey] = await $db
      .insert($schemas.apiKeys)
      .values({
        ...keyData,
        createdAt: syncedTimestamp,
        updatedAt: syncedTimestamp,
      })
      .returning();

    return newApiKey;
  }

  /**
   * Update existing ApiKey with the given data
   * @type {Repositories.ApiKeysRepository['update']}
   */
  async update(id, keyData) {
    const [record] = await $db
      .update($schemas.apiKeys)
      .set({
        ...keyData,
        updatedAt: new Date(),
      })
      .where(eq($schemas.apiKeys.id, id))
      .returning();

    return record;
  }

  /**
   * @type {Repositories.ApiKeysRepository['touch']}
   */
  async touch(keyOrId) {
    const condition =
      typeof keyOrId === 'number'
        ? eq($schemas.apiKeys.id, keyOrId)
        : eq($schemas.apiKeys.key, keyOrId);

    const [record] = await $db
      .update($schemas.apiKeys)
      .set({ lastUsedAt: sql`now()` })
      .where(condition)
      .returning();

    return record || null;
  }

  /**
   * @type {Repositories.ApiKeysRepository['findById']}
   */
  async findById(id) {
    if (!id) {
      return null;
    }

    const [record] = await $db
      .select()
      .from($schemas.apiKeys)
      .where(eq($schemas.apiKeys.id, id));

    return record;
  }

  /**
   * @type {Repositories.ApiKeysRepository['findByValue']}
   */
  async findByValue(value) {
    if (!value) {
      return null;
    }

    const [record] = await $db
      .select()
      .from($schemas.apiKeys)
      .where(eq($schemas.apiKeys.key, value));

    return record;
  }

  /**
   * @type {Repositories.ApiKeysRepository['findAllByUserId']}
   */
  async findAllByUserId(userId, page = 1, limit = 10) {
    const _limit = Math.min(50, limit);
    const offset = (Math.max(1, page) - 1) * _limit;

    return await $db
      .select()
      .from($schemas.apiKeys)
      .where(eq($schemas.apiKeys.ownerId, userId))
      .offset(offset)
      .limit(_limit);
  }

  /**
   * @type {Repositories.ApiKeysRepository['save']}
   */
  async save(record) {
    // Remove id to avoid conflicts during operation
    const { id, ...safeRecord } = record;

    const remoteRecord = await this.findById(id);

    if (remoteRecord) {
      return this.update(id, safeRecord);
    } else {
      return this.create(safeRecord);
    }
  }

  /**
   * @type {Repositories.ApiKeysRepository['delete']}
   */
  async delete(id) {
    // Delete the session from the database
    const [deletedSession] = await $db
      .delete($schemas.apiKeys)
      .where(eq($schemas.apiKeys.id, id))
      .returning();

    return deletedSession;
  }
}

module.exports.apiKeysRepository = new ApiKeysRepository();
