declare namespace Repositories {
  export type UserRecord = Domain.User & {
    id: number;
    createdAt: Date;
    updatedAt: Date;
  };

  /**
   * Repository for managing users in PostgreSQL.
   */
  export interface UsersRepository {
    /**
     * Create a new user.
     * @param userData - The data for the new user.
     * @returns A promise that resolves to the created user.
     */
    create(userData: Domain.User): Promise<UserRecord>;

    /**
     * Find a user by their ID.
     * @param id - The ID of the user.
     * @returns A promise that resolves to the user if found, or null.
     */
    findById(id: number): Promise<UserRecord | null>;

    /**
     * Find a user by his ID. Eager loads the last session.
     * @param id - The ID of the user.
     * @returns A promise that resolves to the user with session if found, or null.
     */
    findByIdWithLastSession(
      id: number
    ): Promise<
      (UserRecord & { lastSession: Repositories.SessionRecord | null }) | null
    >;

    /**
     * Find a user by his ID. Eager loads the session.
     * @param userId - The ID of the user.
     * @param sessionId - The ID of the session.
     * @returns A promise that resolves to the user with session if found, or null.
     */
    findByIdWithTargetSession(
      userId: number,
      sessionId: string
    ): Promise<
      (UserRecord & { session: Repositories.SessionRecord | null }) | null
    >;

    /**
     * Find a user by his username.
     * @param username - The username of the user.
     * @returns A promise that resolves to the user if found, or null.
     */
    findByUsername(username: string): Promise<UserRecord | null>;

    /**
     * Get all users with optional search and pagination.
     * @param search - The search term to filter users.
     * @param page - The page number for pagination.
     * @param limit - The number of users per page.
     * @returns A promise that resolves to the list of users.
     */
    findAll(
      search: string,
      page?: number,
      limit?: number
    ): Promise<UserRecord[]>;

    /**
     * Update a user by their ID.
     * @param id - The ID of the user.
     * @param updateData - The data to update.
     * @returns A promise that resolves to the updated user.
     */
    update(id: number, updateData: Partial<Domain.User>): Promise<UserRecord>;

    /**
     * Save a user record.
     * @param record - The user to save.
     * @returns A promise that resolves to the saved user.
     */
    save(record: Domain.User & { id: number }): Promise<UserRecord>;

    /**
     * Materialize a user entity into a user record.
     * @param entity - The user entity to materialize.
     * @returns A promise that resolves to the materialized user.
     */
    materialize(entity: Domain.UserEntity): Promise<UserRecord>;

    /**
     * Delete a user by their ID.
     * @param id - The ID of the user.
     * @returns A promise that resolves to the deleted user.
     */
    delete(id: number): Promise<UserRecord>;
  }
}
