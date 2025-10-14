const { resourceRepository } = require('@/repositories/resources');

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
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = /**
         * @type {{ id: string }}
         */ (request.params);

        const found = await resourceRepository.findById(id);

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
