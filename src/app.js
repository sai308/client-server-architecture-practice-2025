const Fastify = require('fastify');
const swagger = require('@fastify/swagger');

const { env, session } = require('@/config');
const { logger } = require('@/logger');

const { patchErrorHandling } = require('@/handlers/errors');
const { openApiConfig, registerSchemas } = require('@/docs/openapi');

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

  // Register request context plugin for context propagation
  // see: https://github.com/fastify/fastify-request-context
  await fastify.register(require('@fastify/request-context'), {
    hook: 'preValidation',
    defaultStoreValues: {
      authData: null,
    },
  });

  /**
   * ~ See details on: https://www.fastify.io/docs/latest/Reference/Server/#requestidheader
   * ~ @example https://github.com/fastify/fastify-cookie#sending
   */
  await fastify.register(require('@fastify/cookie'), {
    secret: env.COOKIE_SECRET, // ? for cookies signature
    parseOptions: {
      secure: true,
      httpOnly: true,
      priority: 'high',
      sameSite: session.SAME_SITE,
    },
  });

  await fastify.register(require('@fastify/auth'), { defaultRelation: 'and' });

  await fastify.register(swagger, {
    openapi: openApiConfig,
  });

  // ? Setup error handling, doesn't use infrastructure, so safe to call now
  patchErrorHandling(fastify);

  // ? Register JSON schemas for OpenAPI documentation, it must be done before routing
  registerSchemas(fastify);

  // ! Inline require to wait for infrastructure initialization
  require('@/routes').patchRouting(fastify);
  require('@/handlers/auth').patchAuth(fastify);

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
