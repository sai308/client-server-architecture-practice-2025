const { queryResourcesList } = require('@/useCases/resources/getList');

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
          limit: { type: 'number', minimum: 1, maximum: 100, default: 25 },
          latest: { type: 'boolean', default: false },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            items: {
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
            total: { type: 'number' },
            pages: { type: 'number' },
            stats: {
              type: 'object',
              properties: {
                price: {
                  type: 'object',
                  properties: {
                    min: { type: 'number' },
                    max: { type: 'number' },
                    avg: { type: 'number' },
                  },
                },
                amount: {
                  type: 'object',
                  properties: {
                    min: { type: 'number' },
                    max: { type: 'number' },
                    avg: { type: 'number' },
                  },
                },
                resolvedInMs: { type: 'number' },
              },
            },
            queryParams: {
              type: 'object',
              properties: {
                search: { type: 'string' },
                page: { type: 'number' },
                limit: { type: 'number' },
                latest: { type: 'boolean' },
              },
            },
          },
          required: ['items', 'total', 'pages', 'stats', 'queryParams'],
        },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        500: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
    handler: async (request, reply) => {
      try {
        const list = await queryResourcesList(request.query);

        return reply.code(200).send(list);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch resources' });
      }
    },
  },
};
