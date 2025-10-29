declare namespace Repositories {
  export type SessionRecord = Domain.Session & {
    id: string;
    createdAt: Date;
  };

  /**
   * Repository for managing users in PostgreSQL.
   */
  export interface SessionsRepository {
    /**
     * Create a new session or update existing.
     * @param sessionData - The data for the new session.
     * @returns A promise that resolves to the processed session.
     */
    upsert(sessionData: Domain.Session): Promise<SessionRecord>;

    /**
     * Update the last seen timestamp of a session.
     * @param id - The ID of the session.
     * @returns A promise that resolves to the updated session.
     */
    touch(id: string): Promise<SessionRecord>;

    /**
     * Find a session by it's ID.
     * @param id - The ID of the session.
     * @returns A promise that resolves to the session if found, or null.
     */
    findById(id: string): Promise<SessionRecord | null>;

    /**
     * Find a session by the related user ID.
     * @param userId - The ID of the user.
     * @returns A promise that resolves to the session if found, or null.
     */
    findByUserId(userId: number): Promise<SessionRecord | null>;

    /**
     * Get all sessions of user with pagination support.
     * @param userId - The ID of the related user.
     * @param page - The page number for pagination.
     * @param limit - The number of sessions per page.
     * @returns A promise that resolves to the list of sessions.
     */
    findAllByUserId(
      userId: number,
      page?: number,
      limit?: number
    ): Promise<SessionRecord[]>;

    /**
     * Save a session record.
     * @param record - The session to save.
     * @returns A promise that resolves to the saved session.
     */
    save(record: Domain.Session & { id: string }): Promise<SessionRecord>;

    /**
     * Materialize a session entity into a session record.
     * @param entity - The session entity to materialize.
     * @returns A promise that resolves to the materialized session.
     */
    materialize(entity: Domain.SessionEntity): Promise<SessionRecord>;

    /**
     * Delete a session by their ID.
     * @param id - The ID of the session.
     * @returns A promise that resolves to the deleted session.
     */
    delete(id: string): Promise<SessionRecord | null>;
  }
}
