declare namespace Domain {
  namespace Purchase {
    /**
     * Represents an item in the purchase order.
     */
    export interface OrderItem {
      id: string; // The ID of the resource
      amount: number; // The quantity to purchase
    }

    /**
     * Represents the input for the `purchaseResources` method.
     */
    export interface Order {
      items: OrderItem[]; // The list of resources to purchase
      customerId: number; // The name of the customer
    }

    export interface OrderEntity extends Order {
      getItemsIds(): string[];
    }

    export type OrderConstructorFields = {
      customerId: number;
      items?: OrderItem[];
    };
  }
}
