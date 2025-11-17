const { echoRoute } = require('./echo');
const { shopRouter } = require('./shop');
const { authRouter } = require('./auth');
const { healthCheck } = require('./healthCheck');
const { resourcesRouter } = require('./resources');

/**
 * Patch the routing of the fastify instance
 * @param {import("fastify").FastifyInstance} fastify
 */
module.exports.patchRouting = (fastify) => {
  // Register routes
  fastify.register(echoRoute);
  fastify.register(healthCheck);

  fastify.register(resourcesRouter);
  fastify.register(shopRouter);
  fastify.register(authRouter);

  // Docs
  fastify.get('/openapi.json', async (request, reply) => {
    return fastify.swagger();
  });
};
