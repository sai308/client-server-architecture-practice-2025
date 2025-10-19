declare namespace Services {
  type ResourceMap = ReturnType<
    Repositories.ResourcesRepositoryStatic['toMapped']
  >;

  interface PurchaseService {
    /**
     * Purchase resources and create a bill.
     */
    purchaseResources<
      Order extends Domain.Purchase.OrderEntity,
      Customer extends Domain.UserEntity,
    >(
      order: Order,
      customer: Customer,
      resourcesMap: ResourceMap
    ): {
      bill: Domain.BillEntity;
      updatedCustomer: Customer;
      updatedResources: Repositories.ResourceRecord[];
    };
    /**
     * Refund a bill and restore resource amounts.
     */
    refundByBill<
      Bill extends Domain.BillEntity,
      Customer extends Domain.UserEntity,
    >(
      bill: Bill,
      customer: Customer,
      resourcesMap: ResourceMap
    ): {
      updatedCustomer: Customer;
      updatedResources: Repositories.ResourceRecord[];
    };
  }
}
