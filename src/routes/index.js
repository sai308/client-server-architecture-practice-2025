const { echoRoute } = require('./echo');
const { resourcesRouter } = require('./resources');
const { shopRouter } = require('./shop');

/**
 * Patch the routing of the fastify instance
 * @param {import("fastify").FastifyInstance} fastify
 */
module.exports.patchRouting = (fastify) => {
  // Register routes
  fastify.register(echoRoute);
  fastify.register(resourcesRouter);
  fastify.register(shopRouter);

  // Docs
  fastify.get('/openapi.json', async (request, reply) => {
    return fastify.swagger();
  });

  // // Handle 404 responses
  // fastify.setNotFoundHandler((request, reply) => {
  //   reply.status(404).send({ error: 'Not Found' });
  // });

  // Add a global error handler if needed
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error); // Log the error

    if (error.validation) {
      return reply
        .status(error.statusCode || 400)
        .send({ error: `Invalid request: ${error.message}` });
    }

    reply.status(500).send({ error: 'Internal Server Error' });
  });
};
