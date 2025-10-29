const { $db, $schemas } = require('@/adapters/postgres');
const { eq, ilike, or, desc } = require('drizzle-orm');

/**
 * @description A repository for managing users
 * @implements {Repositories.UsersRepository}
 */
class UsersRepository {
  /**
   * Create a new user with the given data
   * @type {Repositories.UsersRepository['create']}
   */
  async create(userData) {
    const syncedTimestamp = new Date();

    // Insert the new user into the database
    const [newUser] = await $db
      .insert($schemas.users)
      .values({
        ...userData,
        createdAt: syncedTimestamp,
        updatedAt: syncedTimestamp,
      })
      .returning();

    return newUser;
  }

  /**
   * Find a user with the given ID
   * @type {Repositories.UsersRepository['findById']}
   */
  async findById(id) {
    if (!id) {
      return null;
    }

    const [user] = await $db
      .select()
      .from($schemas.users)
      .where(eq($schemas.users.id, id));

    return user || null;
  }

  /**
   * Find a user with the given ID
   * @type {Repositories.UsersRepository['findByIdWithLastSession']}
   */
  async findByIdWithLastSession(id) {
    if (!id) {
      return null;
    }

    const userWithLastSession = await $db.query.users.findFirst({
      where: eq($schemas.users.id, id),
      with: {
        sessions: {
          orderBy: () => [desc($schemas.sessions.createdAt)],
          limit: 1,
        },
      },
    });

    if (!userWithLastSession) {
      return null;
    }

    const { sessions, ...restUser } = userWithLastSession;

    return {
      ...restUser,
      lastSession: sessions.length > 0 ? sessions[0] : null,
    };
  }

  /**
   * Find a user with the given ID and session ID
   * @type {Repositories.UsersRepository['findByIdWithTargetSession']}
   */
  async findByIdWithTargetSession(userId, sessionId) {
    if (!userId) {
      return null;
    }

    const userWithTargetSession = await $db.query.users.findFirst({
      where: eq($schemas.users.id, userId),
      with: {
        sessions: {
          where: eq($schemas.sessions.id, sessionId),
          limit: 1,
        },
      },
    });

    if (!userWithTargetSession) {
      return null;
    }

    const { sessions, ...restUser } = userWithTargetSession;

    return {
      ...restUser,
      session: sessions.length > 0 ? sessions[0] : null,
    };
  }

  /**
   * Find a user by his username.
   * @type {Repositories.UsersRepository['findByUsername']}
   */
  async findByUsername(username) {
    if (!username) {
      return null;
    }

    const [user] = await $db
      .select()
      .from($schemas.users)
      .where(eq($schemas.users.username, username));

    return user || null;
  }

  /**
   * Read all users from the database
   * @type {Repositories.UsersRepository['findAll']}
   */
  async findAll(search, page = 1, limit = 10) {
    const _limit = Math.min(50, limit);
    const offset = (Math.max(1, page) - 1) * _limit;

    const condition = search
      ? or(
          ilike($schemas.users.name, `${search}%`),
          ilike($schemas.users.email, `%${search}%`)
        )
      : undefined;

    return await $db
      .select()
      .from($schemas.users)
      .where(condition)
      .offset(offset)
      .limit(_limit);
  }

  /**
   * Update a user with the given ID using the provided data
   * @param {number} id
   * @param {Partial<Domain.User>} userData
   * @returns {Promise<Repositories.UserRecord>}
   */
  async update(id, userData) {
    const syncedTimestamp = new Date();

    // Update the user in the database
    const [updatedUser] = await $db
      .update($schemas.users)
      .set({
        ...userData,
        updatedAt: syncedTimestamp,
      })
      .where(eq($schemas.users.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  }

  /**
   * @type {Repositories.UsersRepository['save']}
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
   * @type {Repositories.UsersRepository['materialize']}
   */
  async materialize(entity) {
    const record = await this.create({
      age: entity.age,
      name: entity.name,
      email: entity.email,
      balance: entity.balance,
      username: entity.username,
      passwordHash: entity.passwordHash,
      isPrivileged: entity.isPrivileged,
    });

    return record;
  }

  /**
   * Delete a user with the given ID
   * @param {number} id
   * @returns {Promise<Repositories.UserRecord>}
   */
  async delete(id) {
    // Delete the user from the database
    const [deletedUser] = await $db
      .delete($schemas.users)
      .where(eq($schemas.users.id, id))
      .returning();

    return deletedUser;
  }
}

module.exports.usersRepository = new UsersRepository();
