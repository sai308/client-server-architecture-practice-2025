/** @type {Docs.JsonSchemaWithId} */
module.exports.billItemSchema = {
  $id: 'BillItem',
  type: 'object',
  properties: {
    resourceId: { type: 'string' },
    name: { type: 'string' },
    quantity: { type: 'number' },
    price: { type: 'number' },
  },
  required: ['resourceId', 'quantity', 'price', 'name'],
  additionalProperties: false,
};

/** @type {Docs.JsonSchemaWithId} */
module.exports.orderItemSchema = {
  $id: 'OrderItem',
  type: 'object',
  required: ['id', 'amount'],
  properties: {
    id: { type: 'string' },
    amount: { type: 'number', minimum: 1 },
  },
  additionalProperties: false,
};
