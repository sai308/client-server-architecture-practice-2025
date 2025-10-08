const { randomUUID } = require('node:crypto');

/**
 * @description A repository for managing resources
 */
class ResourceRepository {
  constructor() {
    /**
     * @type {Repositories.ResourceMap}
     */
    this.storage = new Map();
  }

  /**
   * Create a new resource with the given data
   * @param {Repositories.ResourceShape} data
   * @returns {Promise<Repositories.ResourceInstance>}
   */
  async create(data) {
    // Generate a random UUID for the new resource
    const id = randomUUID();

    const syncedTimestamp = new Date();

    // Store the new resource in the storage
    this.storage.set(id, {
      id,
      ...data,
      createdAt: syncedTimestamp,
      updatedAt: syncedTimestamp,
    });

    // Return the newly created resource
    return this.storage.get(id);
  }

  /**
   * @template {string?} I
   * Read a resource with the given ID or all resources if no ID is provided
   * @param {I} [id]
   */
  async read(id) {
    // Check if the resource with the given ID exists
    if (id && !this.storage.has(id)) {
      throw new Error('Resource not found');
    }

    // Return the resource with the given ID or all resources
    return /** @type {Repositories.ReadByIdOrNot<I>} */ (
      id ? this.storage.get(id) : Array.from(this.storage.values())
    );
  }

  /**
   * Update a resource with the given ID using the provided data
   * @param {string} id
   * @param {Repositories.ResourceShape | Repositories.ResourceInstance} data
   * @returns {Promise<Repositories.ResourceInstance>}
   */
  async update(id, data) {
    if (!this.storage.has(id)) {
      throw new Error('Resource not found');
    }

    const updatedData = {
      // Get the existing data
      ...this.storage.get(id),
      // and merge with the new data
      ...data,
      // Ensure the ID remains unchanged
      id,
    };

    // Update the resource with the new data
    this.storage.set(id, {
      ...updatedData,
      updatedAt: new Date(),
    });

    // Return the updated resource
    return this.storage.get(id);
  }

  /**
   * Delete a resource with the given ID
   * @param {string} id
   * @returns {Promise<Repositories.ResourceInstance>}
   */
  async delete(id) {
    if (!this.storage.has(id)) {
      throw new Error('Resource not found');
    }

    // Remove the resource from the storage
    const resource = this.storage.get(id);

    this.storage.delete(id);

    // Return the deleted resource
    return resource;
  }
}

module.exports.resourceRepository = new ResourceRepository();
