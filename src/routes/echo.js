module.exports = {
  /**
   * Patch the routing of the fastify instance
   * @param {import("fastify").FastifyInstance} fastify
   */
  async echoRoute(fastify) {
    fastify.post(
      '/echo',
      {
        bodyLimit: 2048,
        schema: {
          body: {
            type: 'object',
            additionalProperties: true,
          },
          response: {
            200: {
              type: 'object',
              additionalProperties: true,
            },
          },
        },
      },
      async (request) => {
        return request.body; // Echo the received data
      }
    );

    fastify.get(
      '/echo',
      {
        schema: {
          response: {
            200: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
      async (request) => {
        return { message: 'Echo GET endpoint is working!' };
      }
    );
  },
};
