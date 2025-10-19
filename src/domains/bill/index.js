class BillItem {
  /**
   * @param {Domain.BillItem} params
   */
  constructor({ resourceId, name, quantity = 1, price = 0 }) {
    this.resourceId = resourceId;
    this.name = name;
    this.quantity = quantity;
    this.price = price;
  }
}

/**
 * @implements {Domain.BillEntity}
 */
class Bill {
  /**
   * @param {Domain.BillConstructorFields} params
   */
  constructor({ _id, customerId, total = 0, items = [] }) {
    this._id = _id?.toString();
    this.customerId = customerId;
    this.total = total;
    this.items = items;
  }

  /**
   * Add an item to the bill and update the total
   * @type {Domain.BillEntity['addItem']}
   */
  addItem(item) {
    this.items.push(new BillItem(item));
    this.total += item.price * item.quantity;
  }

  /**
   * Remove an item from the bill by its index and update the total
   * @type {Domain.BillEntity['removeItem']}
   */
  removeItem(identifier) {
    if (typeof identifier === 'string') {
      const itemIndex =
        typeof identifier === 'number'
          ? identifier
          : this.items.findIndex((i) => i.resourceId === identifier);

      if (itemIndex === -1) return;

      this.total -=
        this.items[itemIndex].price * this.items[itemIndex].quantity;

      this.items.splice(itemIndex, 1);
    }
  }

  /**
   * Get all item IDs in the bill
   * @type {Domain.BillEntity['getItemsIds']}
   */
  getItemsIds() {
    return this.items.map((item) => item.resourceId);
  }
}

module.exports = { Bill, BillItem };
