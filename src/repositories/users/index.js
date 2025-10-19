const { $db, $schemas } = require('@/adapters/postgres');
const { eq, ilike, or } = require('drizzle-orm');

/**
 * @description A repository for managing users
 * @implements {Repositories.UsersRepository}
 */
class UsersRepository {
  /**
   * Create a new user with the given data
   * @param {Domain.User} userData
   * @returns {Promise<Repositories.UserRecord>}
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
   * @param {number} id
   * @returns {Promise<Repositories.UserRecord | null>}
   */
  async findById(id) {
    if (!id) {
      return null;
    }

    const [user] = await $db
      .select()
      .from($schemas.users)
      .where(eq($schemas.users.id, id));

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Read all users from the database
   * @param {string} search
   * @param {number} [page=1]
   * @param {number} [limit=10]
   * @returns {Promise<Repositories.UserRecord[]>}
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
      name: entity.name,
      email: entity.email,
      balance: entity.balance,
      age: entity.age,
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

    if (!deletedUser) {
      throw new Error('User not found');
    }

    return deletedUser;
  }
}

module.exports.usersRepository = new UsersRepository();
