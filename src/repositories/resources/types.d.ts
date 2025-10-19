declare namespace Repositories {
  export type ResourceRecord = Domain.Resource & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  };

  /**
   * Repository for managing resources in PostgreSQL.
   */
  export interface ResourcesRepository {
    /**
     * Create a new resource.
     * @param resourceData - The data for the new resource.
     * @returns A promise that resolves to the created resource.
     */
    create(resourceData: Domain.Resource): Promise<ResourceRecord>;

    /**
     * Find a resource by its ID.
     * @param id - The ID of the resource.
     * @returns A promise that resolves to the resource if found, or null.
     */
    findById(id: string): Promise<ResourceRecord | null>;

    /**
     * Find a resources by their IDs.
     * @param id - The IDs of the resources.
     * @returns A promise that resolves to the resources if found, or an empty array.
     */
    findByIds(ids: string[]): Promise<ResourceRecord[]>;

    /**
     * Get all resources with optional search and pagination.
     * @param search - The search term to filter resources.
     * @param page - The page number for pagination.
     * @param limit - The number of resources per page.
     * @returns A promise that resolves to the list of resources.
     */
    findAll(
      search: string,
      page?: number,
      limit?: number
    ): Promise<ResourceRecord[]>;

    /**
     * Update a resource by its ID.
     * @param id - The ID of the resource.
     * @param resourceData - The data to update.
     * @returns A promise that resolves to the updated resource.
     */
    update(
      id: string,
      resourceData: Partial<Domain.Resource>
    ): Promise<ResourceRecord>;

    /**
     * Save a resource record.
     * @param resource - The resource to save.
     * @returns A promise that resolves to the saved resource.
     */
    save(record: Domain.Resource & { id: string }): Promise<ResourceRecord>;

    /**
     * Materialize a resource entity into a resource record.
     * @param entity - The resource entity to materialize.
     * @returns A promise that resolves to the materialized resource.
     */
    materialize(entity: Domain.ResourceEntity): Promise<ResourceRecord>;

    /**
     * Delete a resource by its ID.
     * @param id - The ID of the resource.
     * @returns A promise that resolves to the deleted resource.
     */
    delete(id: string): Promise<ResourceRecord>;

    /**
     * Convert an array of ResourceRecords into a Map.
     * @param records - The array of ResourceRecords to convert.
     * @returns A Map where the key is the resource ID and the value is the ResourceRecord.
     */
    toMapped(records: ResourceRecord[]): Map<string, ResourceRecord>;
  }
}
