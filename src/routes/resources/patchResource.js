const { resourceRepository } = require('@/repositories/resources');

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
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          price: { type: 'number' },
          amount: { type: 'number' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        // @ts-ignore - We know that the params is defined
        const targetId = request.params.id;

        // @ts-ignore - We know that the body is defined in the schema
        const { amount = 0, price = 0 } = request.body;

        const patched = await resourceRepository.update(targetId, {
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
