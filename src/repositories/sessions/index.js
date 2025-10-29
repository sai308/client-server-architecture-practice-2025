const { $db, $schemas } = require('@/adapters/postgres');
const { eq, sql } = require('drizzle-orm');

/**
 * @description A repository for managing auth sessions.
 * @implements {Repositories.SessionsRepository}
 */
class SessionsRepository {
  /**
   * Create a new session or update existing one
   * @type {Repositories.SessionsRepository['upsert']}
   */
  async upsert(sessionData) {
    const [record] = await $db
      .insert($schemas.sessions)
      .values({
        ...sessionData,
      })
      .onConflictDoUpdate({
        target: $schemas.sessions.fp,
        set: { lastSeenAt: sessionData.lastSeenAt },
      })
      .returning();

    return record;
  }

  /**
   * @type {Repositories.SessionsRepository['touch']}
   */
  async touch(id) {
    const [record] = await $db
      .update($schemas.sessions)
      .set({ lastSeenAt: sql`now()` })
      .where(eq($schemas.sessions.id, id))
      .returning();

    return record || null;
  }

  /**
   * Find a session with the given ID
   * @type {Repositories.SessionsRepository['findById']}
   */
  async findById(id) {
    if (!id) {
      return null;
    }

    const [user] = await $db
      .select()
      .from($schemas.sessions)
      .where(eq($schemas.sessions.id, id));

    if (!user) {
      throw new Error('Session not found');
    }

    return user;
  }

  /**
   * Find a session with the given userId
   * @type {Repositories.SessionsRepository['findByUserId']}
   */
  async findByUserId(userId) {
    if (!userId) {
      return null;
    }

    const [user] = await $db
      .select()
      .from($schemas.sessions)
      .where(eq($schemas.sessions.userId, userId));

    if (!user) {
      throw new Error('Session not found');
    }

    return user;
  }

  /**
   * Read all users from the database
   * @type {Repositories.SessionsRepository['findAllByUserId']}
   */
  async findAllByUserId(userId, page = 1, limit = 10) {
    const _limit = Math.min(50, limit);
    const offset = (Math.max(1, page) - 1) * _limit;

    return await $db
      .select()
      .from($schemas.sessions)
      .where(eq($schemas.sessions.userId, userId))
      .offset(offset)
      .limit(_limit);
  }

  /**
   * @type {Repositories.SessionsRepository['save']}
   */
  async save(record) {
    return this.upsert(record);
  }

  /**
   * @type {Repositories.SessionsRepository['materialize']}
   */
  async materialize(entity) {
    const record = await this.upsert({
      id: entity.id,
      fp: entity.fp,
      userId: entity.userId,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      lastSeenAt: entity.lastSeenAt,
    });

    return record;
  }

  /**
   * Delete a session with the given ID
   * @type {Repositories.SessionsRepository['delete']}
   */
  async delete(id) {
    // Delete the session from the database
    const [deletedSession] = await $db
      .delete($schemas.sessions)
      .where(eq($schemas.sessions.id, id))
      .returning();

    if (!deletedSession) {
      return null;
    }

    return deletedSession;
  }
}

module.exports.sessionsRepository = new SessionsRepository();
