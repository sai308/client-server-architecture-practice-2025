const { resourceRepository } = require('@/repositories/resources');

/**
 * @description Route to delete a resource by ID.
 */
module.exports = {
  /**
   * @type {import('fastify').RouteOptions}
   */
  deleteResource: {
    url: '/resources/:id',
    method: 'DELETE',
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

        const deleted = await resourceRepository.delete(id);

        return reply.code(200).send(deleted);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to delete resource' });
      }
    },
  },
};
