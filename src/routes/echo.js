module.exports = {
  /**
   * Patch the routing of the fastify instance
   * @param {import("fastify").FastifyInstance} fastify
   */
  async echoRoute(fastify) {
    fastify.post('/echo', async (request) => {
      return request.body; // Echo the received data
    });

    fastify.get('/echo', async (request) => {
      return { message: 'Echo GET endpoint is working!' };
    });
  },
};
