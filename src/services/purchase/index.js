const { Bill } = require('@/domains/bill');

/**
 * @implements {Services.PurchaseService}
 */
class PurchaseService {
  /**
   * @type {Services.PurchaseService['purchaseResources']}
   */
  purchaseResources(order, customer, resourcesMap) {
    const bill = new Bill({
      customerId: customer.id,
    });

    for (const { id, amount } of order.items) {
      const resource = resourcesMap.get(id);

      if (!resource) {
        throw new Error(`Resource with ID ${id} not found.`);
      }

      if (resource.amount < amount) {
        throw new Error(
          `Resource "${resource.name}" is exhausted. Available: ${resource.amount}, Requested: ${amount}`
        );
      }

      bill.addItem({
        resourceId: resource.id,
        name: resource.name,
        quantity: amount,
        price: resource.price,
      });

      resource.amount = resource.amount - amount;
    }

    customer.updateBalance(-bill.total);

    return {
      bill,
      updatedCustomer: customer,
      updatedResources: Array.from(resourcesMap.values()),
    };
  }

  /**
   * @type {Services.PurchaseService['refundByBill']}
   */
  refundByBill(bill, customer, resourcesMap) {
    // Restore resource amounts
    for (const item of bill.items) {
      const resource = resourcesMap.get(item.resourceId);

      if (!resource) {
        throw new Error(`Resource with ID ${item.resourceId} not found.`);
      }

      resource.amount = resource.amount + item.quantity;
    }

    customer.updateBalance(+bill.total);

    return {
      updatedCustomer: customer,
      updatedResources: Array.from(resourcesMap.values()),
    };
  }
}

module.exports.purchaseService = new PurchaseService();
