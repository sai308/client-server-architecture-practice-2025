const { purchaseService } = require('@/services/purchase');

/**
 * @description Route to refund purchase by bill.
 */
module.exports = {
  /**
   * @type {import('fastify').RouteOptions}
   */
  refundPurchase: {
    url: '/shop/refund',
    method: 'POST',
    schema: {
      body: {
        type: 'object',
        required: ['billId'],
        properties: {
          billId: { type: 'string' },
        },
      },
      response: {
        200: {
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
        const { billId } =
          /**
           * @type {{ billId: string }}
           */
          (request.body);

        const bill = await purchaseService.refundByBill(billId);

        return reply.code(200).send(bill);
      } catch (error) {
        request.log.error(error);
        return reply.code(400).send({ error: error.message });
      }
    },
  },
};
