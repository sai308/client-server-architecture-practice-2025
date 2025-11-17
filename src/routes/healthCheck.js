module.exports = {
  /**
   * Patch the routing of the fastify instance
   * @param {import("fastify").FastifyInstance} fastify
   */
  async healthCheck(fastify) {
    fastify.route({
      method: ['GET', 'HEAD'],
      url: '/health',
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
            },
          },
        },
      },
      handler: async (request, reply) => {
        return { status: 'OK' };
      },
    });
  },
};
