const { $db, $schemas } = require('@/adapters/postgres');
const { eq, or, ilike, inArray } = require('drizzle-orm');

/**
 * @description A repository for managing resources
 * @implements {Repositories.ResourcesRepository}
 */
class ResourcesRepository {
  /**
   * Create a new resource with the given data
   * @type {Repositories.ResourcesRepository['create']}
   */
  async create(resourceData) {
    const syncedTimestamp = new Date();

    // Insert the new resource into the database
    const [newResource] = await $db
      .insert($schemas.resources)
      .values({
        ...resourceData,
        createdAt: syncedTimestamp,
        updatedAt: syncedTimestamp,
      })
      .returning();

    return newResource;
  }

  /**
   * Find a resource with the given ID
   * @type {Repositories.ResourcesRepository['findById']}
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
   * Find a resource with the given ID
   * @type {Repositories.ResourcesRepository['findByIds']}
   */
  async findByIds(ids) {
    if (!ids?.length) {
      return [];
    }

    const resources = await $db
      .select()
      .from($schemas.resources)
      .where(inArray($schemas.resources.id, ids));

    return resources;
  }

  /**
   * Read all resources from the database
   * @type {Repositories.ResourcesRepository['findAll']}
   */
  async findAll(search, page, limit = 25) {
    const _limit = Math.max(50, limit);
    const offset = (Math.max(1, page) - 1) * _limit;

    const condition = search
      ? or(
          ilike($schemas.resources.name, `${search}%`),
          ilike($schemas.resources.type, `${search}%`)
        )
      : undefined;

    return await $db
      .select()
      .from($schemas.resources)
      .where(condition)
      .offset(offset)
      .limit(_limit);
  }

  /**
   * Update a resource with the given ID using the provided data
   * @type {Repositories.ResourcesRepository['update']}
   */
  async update(id, resourceData) {
    const syncedTimestamp = new Date();

    // Update the resource in the database
    const [updatedResource] = await $db
      .update($schemas.resources)
      .set({
        ...resourceData,
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
   * @type {Repositories.ResourcesRepository['save']}
   */
  async save(record) {
    // Remove id to avoid conflicts during creation
    const { id, ...safeRecord } = record;

    const remoteRecord = await this.findById(id);

    return remoteRecord ? this.update(id, safeRecord) : this.create(safeRecord);
  }

  /**
   * @type {Repositories.ResourcesRepository['materialize']}
   */
  async materialize(entity) {
    const record = await this.create({
      name: entity.name,
      type: entity.type,
      amount: entity.amount,
      price: entity.price,
    });

    return record;
  }

  /**
   * Delete a resource with the given ID
   * @type {Repositories.ResourcesRepository['delete']}
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

  /**
   * @type {Repositories.ResourcesRepository['toMapped']}
   */
  toMapped(resources) {
    return new Map(resources.map((res) => [res.id, res]));
  }
}

module.exports.resourcesRepository = new ResourcesRepository();
