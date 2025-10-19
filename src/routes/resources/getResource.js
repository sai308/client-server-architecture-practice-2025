const { resourcesRepository } = require('@/repositories/resources');

/**
 * @description Route to get a specific resource by ID.
 */
module.exports = {
  /**
   * @type {import('fastify').RouteOptions}
   */
  getResource: {
    url: '/resources/:id',
    method: 'GET',
    schema: {
      description: 'Get a resource by ID',
      tags: ['resources'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
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
        404: { type: 'object', properties: { message: { type: 'string' } } },
        500: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = /**
         * @type {{ id: string }}
         */ (request.params);

        const found = await resourcesRepository.findById(id);

        if (!found) {
          return reply.code(404).send({
            message: 'Resource not found',
          });
        }

        return reply.code(200).send(found);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch resource' });
      }
    },
  },
};
