const { executePurchase } = require('@/useCases/purchaseResources');

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
      description: 'Purchase resources',
      tags: ['shop'],
      body: {
        type: 'object',
        required: ['customerId', 'items'],
        properties: {
          customerId: { type: 'number' },
          items: {
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
            bill: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                customerId: { type: 'number' },
                total: { type: 'number' },
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
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                age: { type: 'number' },
                email: { type: 'string' },
                balance: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        500: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
    handler: async (request, reply) => {
      try {
        const orderCandidate =
          /** @type { Domain.Purchase.Order} */
          (request.body);

        const opRes = await executePurchase(orderCandidate);

        return reply.code(201).send(opRes);
      } catch (error) {
        if (error.cause) {
          request.log.debug(
            error.cause,
            'Request handling was interrupted by the handled error'
          );
        }

        request.log.error(error);

        return reply
          .code('cause' in error ? 400 : 500)
          .send({ error: error.message });
      }
    },
  },
};
