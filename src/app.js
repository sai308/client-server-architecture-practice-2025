const Fastify = require('fastify');

const { env } = require('./config');
const { logger } = require('./logger');
const { patchRouting } = require('./routes');

/**
 * Initializes and configures the Fastify instance
 * @returns {import("fastify").FastifyInstance} Configured Fastify instance
 */
const bootstrapFastify = () => {
  // Create a Fastify instance with desired options
  const fastify = Fastify({
    loggerInstance: logger,
    exposeHeadRoutes: false,
    connectionTimeout: 20_000,
    disableRequestLogging: true,
    routerOptions: {
      ignoreTrailingSlash: true,
    },
  });

  // Register plugins, routes, etc.
  patchRouting(fastify);

  if (env.IS_DEV_ENV) {
    const requestLogger = require('@mgcrea/fastify-request-logger').default;

    fastify.register(requestLogger);

    fastify.ready(() => {
      console.log(`\nAPI Structure\n${fastify.printRoutes()}`);
    });
  }

  return fastify;
};

module.exports = { bootstrapFastify };
