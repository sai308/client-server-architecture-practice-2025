const { executeKeyCreation } = require('@/useCases/auth/key/create');

/**
 * @description Route for API key creation.
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {import('fastify').RouteOptions}
 */
module.exports.createApiKey = (fastify) => ({
  url: '/auth/keys',
  method: 'POST',
  preValidation: fastify.auth([
    fastify.authPipeFactory({ allowApiKey: false }),
    fastify.authGuardFactory({ authMethod: 'session' }),
  ]),
  handler: async (request, reply) => {
    const userAuthData = request.requestContext.get('authData');

    const apiKey = await executeKeyCreation(userAuthData.user.id);

    return reply.code(201).send(apiKey);
  },
  schema: {
    tags: ['auth'],
    description: 'Create a new API key for the authenticated user.',
    security: [{ cookieAuth: [] }],
    response: {
      200: {
        $ref: 'Key#',
      },
      403: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Authorization failed. Not enough permissions.',
          },
        },
        required: ['message'],
      },
      500: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Failed to create API key',
          },
        },
        required: ['message'],
      },
    },
  },
});
