const { env, session } = require('@/config');
const schemas = require('@/docs/schemas');

/**
 * Patch the routing of the fastify instance
 * @param {import("fastify").FastifyInstance} fastify
 */
module.exports.registerSchemas = async function (fastify) {
  for (const schema of Object.values(schemas)) {
    fastify.addSchema(schema);
    fastify.log.debug(`Registered schema: ${schema.$id}`);
  }
};

/**
 * @type {Partial<import('@fastify/swagger').FastifyDynamicSwaggerOptions['openapi']>}
 */
module.exports.openApiConfig = {
  info: {
    title: 'Fastify App',
    version: env.APP_VERSION,
    description: 'API documentation for Fastify App',
  },
  servers: [{ url: '/api', description: 'With gateway prefix' }],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: session.COOKIE_NAME,
        description: 'Signed session cookie set by login',
      },
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'Opaque API key.',
      },
    },
  },
};
