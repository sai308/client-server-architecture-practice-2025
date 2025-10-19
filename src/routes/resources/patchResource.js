const { resourcesRepository } = require('@/repositories/resources');

/**
 * @description Route to partially update a resource by ID. Only `amount` and `price` can be updated.
 */
module.exports = {
  /**
   * @type {import('fastify').RouteOptions}
   */
  patchResource: {
    url: '/resources/:id',
    method: 'PATCH',
    bodyLimit: 1024,
    schema: {
      description: 'Partially update a resource by ID',
      tags: ['resources'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['price', 'amount'],
        properties: {
          price: { type: 'number', minimum: 0 },
          amount: { type: 'number', minimum: 0 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            type: { type: 'string' },
            price: { type: 'number', minimum: 0 },
            amount: { type: 'number', minimum: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
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

        const { amount = 0, price = 0 } = /**
         * @type {{amount?: number, price?: number}}
         */ (request.body);

        const patched = await resourcesRepository.update(id, {
          amount,
          price,
        });

        return reply.code(200).send(patched);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to patch resource' });
      }
    },
  },
};
