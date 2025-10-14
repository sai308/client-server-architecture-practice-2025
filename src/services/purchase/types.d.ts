declare namespace Services {
  namespace Purchase {
    /**
     * Represents an item in the purchase order.
     */
    export interface OrderItem {
      id: string; // The ID of the resource
      amount: number; // The quantity to purchase
    }

    /**
     * Represents an item in the bill.
     */
    export interface BillItem {
      resourceId: string; // The ID of the resource
      name: string; // The name of the resource
      quantity: number; // The quantity purchased
      price: number; // The price per unit
    }

    /**
     * Represents the input for the `purchaseResources` method.
     */
    export interface Input {
      order: OrderItem[]; // The list of resources to purchase
      customerName: string; // The name of the customer
    }
  }
}
