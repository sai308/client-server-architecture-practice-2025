const { echoRoute } = require('./echo');

/**
 * Patch the routing of the fastify instance
 * @param {import("fastify").FastifyInstance} fastify
 */
module.exports.patchRouting = (fastify) => {
  // Register routes
  fastify.register(echoRoute);

  // // Handle 404 responses
  // fastify.setNotFoundHandler((request, reply) => {
  //   reply.status(404).send({ error: 'Not Found' });
  // });

  // Add a global error handler if needed
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error); // Log the error
    reply.status(500).send({ error: 'Internal Server Error' });
  });
};
