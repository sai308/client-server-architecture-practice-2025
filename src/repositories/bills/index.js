const { $cols } = require('@/adapters/mongo');
const { ObjectId } = require('mongodb');

/**
 * Repository for managing bills in MongoDB
 * @implements {Repositories.BillsRepository}
 */
class BillsRepository {
  /**
   * Create a new bill
   * @param {Omit<Repositories.Bill, '_id' | 'createdAt' | 'updatedAt'>} billData - The data for the new bill
   * @returns {Promise<Repositories.Bill>} The created bill
   */
  async create(billData) {
    const createdAt = new Date();
    const result = await $cols.bills().insertOne({ ...billData, createdAt });
    return { _id: result.insertedId.toString(), ...billData, createdAt };
  }

  /**
   * Find a bill by its ID
   * @param {string} id - The string ID of the bill
   * @returns {Promise<Repositories.Bill | null>} The bill if found, or null
   */
  async findById(id) {
    const bill = await $cols.bills().findOne({ _id: new ObjectId(id) });

    if (!bill) return null;

    // Dirty type casting to support d.ts types
    const _bill = /**
     * @type {Repositories.Bill|null}
     */ ({ ...bill, _id: bill._id.toString() });

    return _bill;
  }

  /**
   * Get all bills with optional filters
   * @param {Repositories.BillFilter} [filter={}] - The filter criteria
   * @returns {Promise<Repositories.Bill[]>} The list of bills
   */
  async findAll(filter = {}) {
    const bills = await $cols.bills().find(filter).toArray();

    // Dirty type casting to support d.ts types
    const _bills = /**
     * @type {Repositories.Bill[]}
     */ (bills.map((bill) => ({ ...bill, _id: bill._id.toString() })));

    return _bills;
  }

  /**
   * Update a bill by its ID
   * @param {string} id - The string ID of the bill
   * @param {Partial<Omit<Repositories.Bill, '_id' | 'createdAt'>>} updateData - The data to update
   * @returns {Promise<Repositories.Bill | null>} The updated bill if found, or null
   */
  async update(id, updateData) {
    const result = await $cols
      .bills()
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );

    if (!result.value) {
      return null;
    }

    return { ...result.value, _id: result.value._id.toString() };
  }

  /**
   * Delete a bill by its ID
   * @param {string} id - The string ID of the bill
   * @returns {Promise<Repositories.Bill | null>} The deleted bill if found, or null
   */
  async delete(id) {
    const result = await $cols
      .bills()
      .findOneAndDelete({ _id: new ObjectId(id) });

    if (!result.value) {
      return null;
    }

    return { ...result.value, _id: result.value._id.toString() };
  }
}

module.exports.billsRepository = new BillsRepository();
