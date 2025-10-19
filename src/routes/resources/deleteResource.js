const { resourcesRepository } = require('@/repositories/resources');

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
      description: 'Delete a resource by ID',
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
        500: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = /**
         * @type {{ id: string }}
         */ (request.params);

        const deleted = await resourcesRepository.delete(id);

        return reply.code(200).send(deleted);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to delete resource' });
      }
    },
  },
};
