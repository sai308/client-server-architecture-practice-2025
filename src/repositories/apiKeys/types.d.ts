declare namespace Repositories {
  export type ApiKeyRecord = Domain.ApiKey & {
    id: number;
    createdAt: Date;
    updatedAt: Date;
  };

  /**
   * Repository for managing API keys in PostgreSQL.
   */
  export interface ApiKeysRepository {
    /**
     * Create a new ApiKey.
     * @param keyData - The data for the new ApiKey.
     * @returns A promise that resolves to the created ApiKey.
     */
    create(keyData: Domain.ApiKey): Promise<ApiKeyRecord>;

    /**
     * Update the last seen timestamp of a ApiKey.
     * @param id - The ID of the ApiKey.
     * @returns A promise that resolves to the updated ApiKey.
     */
    touch(keyOrId: string | number): Promise<ApiKeyRecord>;

    /**
     * Update a ApiKey by it's ID.
     * @param id - The ID of the user.
     * @param updateData - The data to update.
     * @returns A promise that resolves to the updated user.
     */
    update(
      id: number,
      updateData: Partial<Domain.ApiKey>
    ): Promise<ApiKeyRecord>;

    /**
     * Find a ApiKey by it's ID.
     * @param id - The ID of the ApiKey.
     * @returns A promise that resolves to the ApiKey if found, or null.
     */
    findById(id: number): Promise<ApiKeyRecord | null>;

    /**
     * Find a ApiKey by the key value.
     * @param keyValue - The ID of the ApiKey.
     * @returns A promise that resolves to the ApiKey if found, or null.
     */
    findByValue(keyValue: string): Promise<ApiKeyRecord | null>;

    /**
     * Get all ApiKey's of user with pagination support.
     * @param userId - The ID of the related user.
     * @param page - The page number for pagination.
     * @param limit - The number of ApiKey's per page.
     * @returns A promise that resolves to the list of ApiKey's.
     */
    findAllByUserId(
      userId: number,
      page?: number,
      limit?: number
    ): Promise<ApiKeyRecord[]>;

    /**
     * Save a ApiKey record.
     * @param record - The ApiKey to save.
     * @returns A promise that resolves to the saved ApiKey.
     */
    save(record: Domain.ApiKey & { id: number }): Promise<ApiKeyRecord>;

    /**
     * Delete a ApiKey by it's ID.
     * @param id - The ID of the ApiKey.
     * @returns A promise that resolves to the deleted ApiKey.
     */
    delete(id: number): Promise<ApiKeyRecord>;
  }
}
