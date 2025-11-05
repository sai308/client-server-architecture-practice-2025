const { describe, test } = require('node:test');
const assert = require('node:assert/strict');

const { purchaseService } = require('@/services/purchase');

function createCustomer() {
  return {
    id: 123,
    balance: 100,
    updateBalance(delta) {
      this.balance += delta;
    },
  };
}

function createResources() {
  return new Map([
    [
      'r1',
      {
        id: 'r1',
        name: 'Resource 1',
        amount: 5,
        price: 10,
      },
    ],
    [
      'r2',
      {
        id: 'r2',
        name: 'Resource 2',
        amount: 2,
        price: 5,
      },
    ],
  ]);
}

describe('Purchase service', () => {
  test('#purchaseResources - successful purchase updates bill, customer balance and resource amounts', () => {
    const order = {
      customerId: 123,
      items: [
        { id: 'r1', amount: 2 },
        { id: 'r2', amount: 1 },
      ],
    };

    const resources = createResources();
    const customer = createCustomer();

    const beforeBalance = customer.balance;

    const { bill, updatedCustomer, updatedResources } =
      // @ts-ignore - mocked data
      purchaseService.purchaseResources(order, customer, resources);

    // totals
    assert.strictEqual(bill.items.length, 2);
    assert.strictEqual(bill.total, 2 * 10 + 1 * 5);

    // customer balance decreased by bill.total (updateBalance called with -bill.total)
    assert.strictEqual(updatedCustomer.balance, beforeBalance - bill.total);

    // resource amounts updated
    const r1 = updatedResources.find((r) => r.id === 'r1');
    const r2 = updatedResources.find((r) => r.id === 'r2');

    assert.strictEqual(r1.amount, 3); // 5 - 2
    assert.strictEqual(r2.amount, 1); // 2 - 1
  });

  test('#purchaseResources - throws when resource not found', () => {
    const order = { items: [{ id: 'missing', amount: 1 }] };
    const resources = createResources();
    const customer = createCustomer();

    assert.throws(
      // @ts-ignore - mocked data
      () => purchaseService.purchaseResources(order, customer, resources),
      {
        message: /not found/,
      }
    );
  });

  test('#purchaseResources - throws when requested amount exceeds available', () => {
    const order = { items: [{ id: 'r2', amount: 10 }] };
    const resources = createResources();
    const customer = createCustomer();

    assert.throws(
      // @ts-ignore - mocked data
      () => purchaseService.purchaseResources(order, customer, resources),
      {
        message: /exhausted/,
      }
    );
  });

  test('#refundByBill - restores resource amounts and refunds customer', () => {
    const resources = createResources();
    const customer = createCustomer();

    // Simulate a bill that consumed 2 of r1
    const bill = {
      _id: 'bill-1',
      customerId: customer.id,
      items: [{ resourceId: 'r1', name: 'Resource 1', quantity: 2, price: 10 }],
      total: 20,
    };

    const beforeBalance = customer.balance;
    const beforeR1 = resources.get('r1').amount;

    const { updatedCustomer, updatedResources } = purchaseService.refundByBill(
      // @ts-ignore - mocked data
      bill,
      customer,
      resources
    );

    // customer refunded
    assert.strictEqual(updatedCustomer.balance, beforeBalance + bill.total);

    // resource restored
    const r1 = updatedResources.find((r) => r.id === 'r1');
    assert.strictEqual(r1.amount, beforeR1 + 2);
  });
});
