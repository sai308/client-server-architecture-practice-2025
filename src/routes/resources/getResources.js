const { resourcesRepository } = require('@/repositories/resources');

/**
 * @description Route to fetch all resources.
 */
module.exports = {
  /**
   * @type {import('fastify').RouteOptions}
   */
  getResources: {
    url: '/resources',
    method: 'GET',
    schema: {
      description: 'Fetch all resources with optional search and pagination',
      tags: ['resources'],
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string' },
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 25 },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
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
        },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        500: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
    handler: async (request, reply) => {
      try {
        const { search, page, limit } = /**
         * @type {{ search?: string, page?: number, limit?: number }}
         */ (request.query);

        const list = await resourcesRepository.findAll(search, page, limit);

        return reply.code(200).send(list);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch resources' });
      }
    },
  },
};
