namespace Domain {
  export type Resource = {
    name: string;
    type: string;
    amount: number;
    price: number;
  };

  export interface ResourceEntity extends Resource {
    id?: string;
    totalPrice: number;
  }

  export type ResourceConstructorFields = {
    id?: string;
    name: string;
    type: string;
    amount?: number;
    price?: number;
  };
}
