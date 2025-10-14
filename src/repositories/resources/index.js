const { $db, $schemas } = require('@/adapters/postgres');
const { eq, or, ilike } = require('drizzle-orm');

/**
 * @description A repository for managing resources
 */
class ResourceRepository {
  /**
   * Create a new resource with the given data
   * @param {Repositories.ResourceShape} data
   * @returns {Promise<Repositories.ResourceInstance>}
   */
  async create(data) {
    const syncedTimestamp = new Date();

    // Insert the new resource into the database
    const [newResource] = await $db
      .insert($schemas.resources)
      .values({
        ...data,
        amount: data.amount,
        price: data.price,
        createdAt: syncedTimestamp,
        updatedAt: syncedTimestamp,
      })
      .returning();

    return newResource;
  }

  /**
   * Find a resource with the given ID
   * @param {string} [id]
   * @returns {Promise<Repositories.ResourceInstance | null>}
   */
  async findById(id) {
    if (!id) {
      return null;
    }

    const [resource] = await $db
      .select()
      .from($schemas.resources)
      .where(eq($schemas.resources.id, id));

    if (!resource) {
      throw new Error('Resource not found');
    }

    return resource;
  }

  /**
   * Read all resources from the database
   * @param {string} search
   * @param {number} [page=1]
   * @param {number} [limit=10]
   * @returns {Promise<Repositories.ResourceInstance[]>}
   */
  async findAll(search, page, limit = 25) {
    const _limit = Math.max(50, limit);
    const offset = (Math.max(1, page) - 1) * _limit;

    return await $db
      .select()
      .from($schemas.resources)
      .where(
        or(
          ilike($schemas.resources.name, `${search}%`),
          ilike($schemas.resources.type, `${search}%`)
        )
      )
      .offset(offset)
      .limit(_limit);
  }

  /**
   * Update a resource with the given ID using the provided data
   * @param {string} id
   * @param {Partial<Repositories.ResourceShape>} data
   * @returns {Promise<Repositories.ResourceInstance>}
   */
  async update(id, data) {
    const syncedTimestamp = new Date();

    // Update the resource in the database
    const [updatedResource] = await $db
      .update($schemas.resources)
      .set({
        ...data,
        updatedAt: syncedTimestamp,
      })
      .where(eq($schemas.resources.id, id))
      .returning();

    if (!updatedResource) {
      throw new Error('Resource not found');
    }

    return updatedResource;
  }

  /**
   * Delete a resource with the given ID
   * @param {string} id
   * @returns {Promise<Repositories.ResourceInstance>}
   */
  async delete(id) {
    // Delete the resource from the database
    const [deletedResource] = await $db
      .delete($schemas.resources)
      .where(eq($schemas.resources.id, id))
      .returning();

    if (!deletedResource) {
      throw new Error('Resource not found');
    }

    return deletedResource;
  }
}

module.exports.resourceRepository = new ResourceRepository();
