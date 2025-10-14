const { purchaseService } = require('@/services/purchase');

/**
 * @description Route to purchase resources.
 */
module.exports = {
  /**
   * @type {import('fastify').RouteOptions}
   */
  purchaseResources: {
    url: '/shop/purchase',
    method: 'POST',
    schema: {
      body: {
        type: 'object',
        required: ['customerName', 'order'],
        properties: {
          customerName: { type: 'string' },
          order: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'amount'],
              properties: {
                id: { type: 'string' },
                amount: { type: 'number', minimum: 1 },
              },
            },
          },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            customerName: { type: 'string' },
            amount: { type: 'number' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  resourceId: { type: 'string' },
                  name: { type: 'string' },
                  quantity: { type: 'number' },
                  price: { type: 'number' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        500: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
    handler: async (request, reply) => {
      try {
        const { customerName, order } =
          /** @type {{ customerName: string, order: Services.Purchase.OrderItem[] }} */
          (request.body);

        const bill = await purchaseService.purchaseResources(
          order,
          customerName
        );

        return reply.code(201).send(bill);
      } catch (error) {
        request.log.error(error);
        return reply.code(400).send({ error: error.message });
      }
    },
  },
};
