const { resourceRepository } = require('@/repositories/resources');

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
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string' },
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 25 },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { search, page, limit } = /**
         * @type {{ search?: string, page?: number, limit?: number }}
         */ (request.query);

        const list = await resourceRepository.findAll(search, page, limit);

        return reply.code(200).send(list);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch resources' });
      }
    },
  },
};
