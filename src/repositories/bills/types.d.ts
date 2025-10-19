declare namespace Repositories {
  export type BillDocument = Domain.Bill & {
    _id: string; // The unique ID of the bill (as a string, not ObjectId)
    createdAt: Date; // The creation date of the bill
    updatedAt?: Date; // The last updated date of the bill (optional)
  };

  /**
   * Filter criteria for finding bills.
   */
  export type BillFilter = {
    customerName?: string; // Filter by customer name
    total?: number; // Filter by amount
    [key: string]: any; // Additional filter fields
  };

  /**
   * Repository for managing bills in MongoDB.
   */
  export interface BillsRepository {
    /**
     * Create a new bill.
     * @param billData - The data for the new bill.
     * @returns A promise that resolves to the created bill.
     */
    create(billData: Domain.Bill): Promise<BillDocument>;

    /**
     * Find a bill by its ID.
     * @param id - The string ID of the bill.
     * @returns A promise that resolves to the bill if found, or null.
     */
    findById(id: string): Promise<BillDocument | null>;

    /**
     * Get all bills with optional filters.
     * @param filter - The filter criteria.
     * @returns A promise that resolves to the list of bills.
     */
    findAll(filter?: BillFilter): Promise<BillDocument[]>;

    /**
     * Update a bill by its ID.
     * @param id - The string ID of the bill.
     * @param updateData - The data to update.
     * @returns A promise that resolves to the updated bill if found, or null.
     */
    update(
      id: string,
      updateData: Partial<Omit<BillDocument, '_id' | 'createdAt'>>
    ): Promise<Bill | null>;

    /**
     * Save a bill document.
     * @param bill - The bill document to save.
     * @returns A promise that resolves to the saved bill document.
     */
    save(document: Domain.Bill & { _id: string }): Promise<BillDocument>;

    /**
     * Materialize a bill entity into a bill record.
     * @param entity - The bill entity to materialize.
     * @returns A promise that resolves to the materialized bill.
     */
    materialize(entity: Domain.BillEntity): Promise<BillDocument>;

    /**
     * Delete a bill by its ID.
     * @param id - The string ID of the bill.
     * @returns A promise that resolves to the deleted bill if found, or null.
     */
    delete(id: string): Promise<BillDocument | null>;
  }
}
