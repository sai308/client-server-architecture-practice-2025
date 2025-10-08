declare namespace Repositories {
  export type ResourceShape = {
    name: string;
    type: string;
    amount: number;
    price: number;
  };

  export type ResourceInstance = ResourceShape & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  };

  export type ResourceMap = Map<string, ResourceInstance>;

  export type ReadByIdOrNot<I> = I extends string
    ? ResourceInstance
    : ResourceInstance[];
}
