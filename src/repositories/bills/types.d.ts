declare namespace Repositories {
  /**
   * Represents a bill in the system.
   */
  export interface Bill {
    _id: string; // The unique ID of the bill (as a string, not ObjectId)
    customerName: string; // The name of the customer
    total: number; // The total amount of the bill
    items: Array<{
      resourceId: string; // Id of the item
      name: string; // Name of the item
      quantity: number; // Quantity of the item
      price: number; // Price per unit of the item
    }>; // List of items in the bill
    createdAt: Date; // The creation date of the bill
    updatedAt?: Date; // The last updated date of the bill (optional)
  }

  /**
   * Filter criteria for finding bills.
   */
  export interface BillFilter {
    customerName?: string; // Filter by customer name
    total?: number; // Filter by amount
    [key: string]: any; // Additional filter fields
  }

  /**
   * Repository for managing bills in MongoDB.
   */
  export interface BillsRepository {
    /**
     * Create a new bill.
     * @param billData - The data for the new bill.
     * @returns A promise that resolves to the created bill.
     */
    create(
      billData: Omit<Bill, '_id' | 'createdAt' | 'updatedAt'>
    ): Promise<Bill>;

    /**
     * Find a bill by its ID.
     * @param id - The string ID of the bill.
     * @returns A promise that resolves to the bill if found, or null.
     */
    findById(id: string): Promise<Bill | null>;

    /**
     * Get all bills with optional filters.
     * @param filter - The filter criteria.
     * @returns A promise that resolves to the list of bills.
     */
    findAll(filter?: BillFilter): Promise<Bill[]>;

    /**
     * Update a bill by its ID.
     * @param id - The string ID of the bill.
     * @param updateData - The data to update.
     * @returns A promise that resolves to the updated bill if found, or null.
     */
    update(
      id: string,
      updateData: Partial<Omit<Bill, '_id' | 'createdAt'>>
    ): Promise<Bill | null>;

    /**
     * Delete a bill by its ID.
     * @param id - The string ID of the bill.
     * @returns A promise that resolves to the deleted bill if found, or null.
     */
    delete(id: string): Promise<Bill | null>;
  }
}
