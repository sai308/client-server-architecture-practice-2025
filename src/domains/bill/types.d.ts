namespace Domain {
  export interface Bill {
    customerId: number; // The ID of the customer
    total: number; // The total amount of the bill
    items: Array<BillItem>; // List of items in the bill
  }

  export interface BillItem {
    resourceId: string; // Id of the item
    name: string; // Name of the item
    quantity: number; // Quantity of the item
    price: number; // Price per unit of the item
  }

  export interface BillEntity extends Bill {
    _id?: string;
    getItemsIds(): string[];
    addItem(item: BillItem): void;
    removeItem(identifier: number | string): void;
  }

  export type BillConstructorFields = {
    _id?: string;
    customerId: number;
    items?: Array<BillItem>;
    total?: number;
  };
}
