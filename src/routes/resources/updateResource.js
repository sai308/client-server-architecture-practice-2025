const { resourcesRepository } = require('@/repositories/resources');

/**
 * @description Route to update a resource by ID. All fields can be updated.
 */
module.exports = {
  /**
   * @type {import('fastify').RouteOptions}
   */
  updateResource: {
    url: '/resources/:id',
    method: 'PUT',
    bodyLimit: 1024,
    schema: {
      description: 'Update a resource by ID',
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
        required: ['name', 'type'],
        additionalProperties: false,
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100 },
          type: { type: 'string', minLength: 3, maxLength: 50 },
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
        const params = /**
         * @type {{ id: string }}
         */ (request.params);

        const targetId = params.id;

        const {
          name,
          type,
          amount = 0,
          price = 0,
        } = /**
         * @type {{ name: string, type: string, amount?: number, price?: number }}
         */ (request.body);

        const updated = await resourcesRepository.update(targetId, {
          name,
          type,
          amount,
          price,
        });

        return reply.code(200).send(updated);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to update resource' });
      }
    },
  },
};
