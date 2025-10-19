const { $cols } = require('@/adapters/mongo');
const { ObjectId } = require('mongodb');

/**
 * Repository for managing bills in MongoDB
 * @implements {Repositories.BillsRepository}
 */
class BillsRepository {
  #db;

  constructor() {
    this.#db = $cols.bills();
  }

  /**
   * Create a new bill
   * @type {Repositories.BillsRepository['create']}
   */
  async create(billData) {
    const createdAt = new Date();
    const result = await this.#db.insertOne({ ...billData, createdAt });
    return { _id: result.insertedId.toString(), ...billData, createdAt };
  }

  /**
   * Find a bill by its ID
   * @type {Repositories.BillsRepository['findById']}
   */
  async findById(id) {
    const bill = await this.#db.findOne({ _id: new ObjectId(id) });

    if (!bill) return null;

    // Dirty type casting to support d.ts types
    const _bill = /**
     * @type {Repositories.BillDocument|null}
     */ ({ ...bill, _id: bill._id.toString() });

    return _bill;
  }

  /**
   * Get all bills with optional filters
   * @type {Repositories.BillsRepository['findAll']}
   */
  async findAll(filter = {}) {
    const bills = await this.#db.find(filter).toArray();

    // Dirty type casting to support d.ts types
    const _bills = /**
     * @type {Repositories.BillDocument[]}
     */ (bills.map((bill) => ({ ...bill, _id: bill._id.toString() })));

    return _bills;
  }

  /**
   * Update a bill by its ID
   * @type {Repositories.BillsRepository['update']}
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
   * @type {Repositories.BillsRepository['save']}
   */
  async save(document) {
    const { _id, ...safeDocument } = document;
    const remoteDocument = await this.findById(_id);

    return remoteDocument
      ? this.update(_id, safeDocument)
      : this.create(safeDocument);
  }

  /**
   * @type {Repositories.BillsRepository['materialize']}
   */
  async materialize(entity) {
    const document = await this.create({
      customerId: entity.customerId,
      total: entity.total,
      items: entity.items,
    });

    return document;
  }

  /**
   * Delete a bill by its ID
   * @type {Repositories.BillsRepository['delete']}
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
