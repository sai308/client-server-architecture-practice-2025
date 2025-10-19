const { billsRepository } = require('@/repositories/bills');

/**
 * @description Route to purchase resources.
 */
module.exports = {
  /**
   * @type {import('fastify').RouteOptions}
   */
  purchaseResources: {
    url: '/shop/bill',
    method: 'GET',
    schema: {
      description: 'Get purchase bill',
      tags: ['shop'],
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            pattern: '^[0-9a-fA-F]{24}$',
            example: '60d5ec49f1d2c916c4a4d3b2',
          },
        },
        required: ['id'],
      },
      response: {
        201: {
          type: 'object',
          properties: {
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
        },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        500: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = /**
         * @type {{ id: string }}
         */ (request.params);

        const found = await billsRepository.findById(id);

        if (!found) {
          return reply.code(404).send({
            message: 'Bill not found',
          });
        }

        return reply.code(200).send(found);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch bill' });
      }
    },
  },
};
