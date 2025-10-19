/**
 * @implements {Domain.UserEntity}
 */
class User {
  /**
   * @param {Domain.UserConstructorFields} fields
   */
  constructor(fields) {
    this.id = fields.id;
    this.name = fields.name;
    this.age = fields.age;
    this.email = fields.email;
    this.balance = fields.balance ?? 0;
  }

  /**
   * @type {Domain.UserEntity['updateBalance']}
   */
  updateBalance(amount) {
    const newBalance = this.balance + amount;

    if (newBalance < 0) {
      throw new Error('Insufficient balance. The balance cannot be negative.');
    }

    return this;
  }
}

module.exports = { User };
