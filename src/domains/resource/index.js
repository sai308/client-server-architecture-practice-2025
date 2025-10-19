/**
 * @implements {Domain.ResourceEntity}
 */
class Resource {
  /**
   * @param {Domain.ResourceConstructorFields} fields
   */
  constructor(fields) {
    this.id = fields.id;
    this.name = fields.name;
    this.type = fields.type;
    this.amount = fields.amount ?? 0;
    this.price = fields.price ?? 0;
  }

  get totalPrice() {
    return this.amount * this.price;
  }
}

module.exports = { Resource };
