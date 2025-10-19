/**
 * @implements {Domain.Purchase.OrderItem}
 */
class OrderItem {
  /**
   * @param {Domain.Purchase.OrderItem} params
   */
  constructor({ id, amount }) {
    this.id = id;
    this.amount = amount;
  }
}

/**
 * @implements {Domain.Purchase.OrderEntity}
 */
class Order {
  /**
   * @param {Domain.Purchase.OrderConstructorFields} params
   */
  constructor({ customerId, items = [] }) {
    this.customerId = customerId;
    this.items = items.map((item) => new OrderItem(item));
  }

  getItemsIds() {
    return this.items.map((item) => item.id);
  }
}

module.exports = { Order, OrderItem };
