const { resourceRepository } = require('@/repositories/resources');
const { billsRepository } = require('@/repositories/bills');

class PurchaseService {
  /**
   * Purchase resources and create a bill.
   * @param {Services.Purchase.OrderItem[]} order - The list of resources to purchase.
   * @param {string} customerName - The name of the customer.
   * @returns {Promise<Repositories.Bill>} The created bill.
   * @throws {Error} If any resource is unavailable or exhausted.
   */
  async purchaseResources(order, customerName) {
    const billItems = [];
    let totalAmount = 0;

    // Check availability for all resources in the order
    for (const { id, amount } of order) {
      const resource = await resourceRepository.findById(id);

      if (!resource) {
        throw new Error(`Resource with ID ${id} not found.`);
      }

      if (resource.amount < amount) {
        throw new Error(
          `Resource "${resource.name}" is exhausted. Available: ${resource.amount}, Requested: ${amount}`
        );
      }

      // Add to bill items
      billItems.push({
        resourceId: resource.id,
        name: resource.name,
        quantity: amount,
        price: resource.price,
      });

      totalAmount += resource.price * amount;
    }

    // Update resource amounts in the database
    for (const { id, amount } of order) {
      const resource = await resourceRepository.findById(id);
      await resourceRepository.update(id, {
        amount: resource.amount - amount,
      });
    }

    // Create a bill
    const bill = await billsRepository.create({
      customerName,
      total: totalAmount,
      items: billItems,
    });

    return bill;
  }

  /**
   * Refund a bill and restore resource amounts.
   * @param {string} billId - The ID of the bill to refund.
   * @returns {Promise<Repositories.Bill>} The refunded bill.
   * @throws {Error} If the bill is not found.
   */
  async refundByBill(billId) {
    const bill = await billsRepository.findById(billId);

    if (!bill) {
      throw new Error(`Bill with ID ${billId} not found.`);
    }

    // Restore resource amounts
    for (const item of bill.items) {
      const resource = await resourceRepository.findById(item.resourceId);

      if (!resource) {
        throw new Error(`Resource with ID ${item.resourceId} not found.`);
      }

      await resourceRepository.update(resource.id, {
        amount: resource.amount + item.quantity,
      });
    }

    return bill;
  }
}

module.exports.purchaseService = new PurchaseService();
