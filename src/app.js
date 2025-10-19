const Fastify = require('fastify');
const swagger = require('@fastify/swagger');
const scalar = require('@scalar/fastify-api-reference').default;

const { env } = require('@/config');
const { logger } = require('@/logger');

/**
 * Initializes and configures the Fastify instance
 * @returns {Promise<import("fastify").FastifyInstance>} Configured Fastify instance
 */
const bootstrapFastify = async () => {
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

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'My Fastify App',
        version: '0.4.0',
      },
      servers: [
        { url: '/api', description: 'Gateway prefix' },
        // You can add more, e.g. absolute URLs for prod/sandbox if you like
        // { url: 'https://api.example.com/api', description: 'Production' }
      ],
      // components: {
      //   securitySchemes: {
      //     apiKey: {
      //       type: 'apiKey',
      //       name: 'apiKey',
      //       in: 'header',
      //     },
      //   },
      // },
    },
  });

  await fastify.register(scalar, {
    routePrefix: '/reference',
    configuration: {
      pathRouting: { basePath: '/api/reference' },
      // make the UI fetch the spec explicitly
      url: '/api/openapi.json',
    },
  });

  // Register plugins, routes, etc.
  // ! Inline require to wait for infrastructure initialization
  require('@/routes').patchRouting(fastify);

  if (env.IS_DEV_ENV) {
    const requestLogger = require('@mgcrea/fastify-request-logger').default;

    fastify.register(requestLogger);

    fastify.ready(() => {
      console.log(`\nAPI Structure\n${fastify.printRoutes()}`);
    });
  }

  await fastify.ready();

  return fastify;
};

module.exports = { bootstrapFastify };
