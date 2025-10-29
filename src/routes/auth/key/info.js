const { executeInfoQuery } = require('@/useCases/auth/key/info');

/**
 * @description Route to get authenticated user info.
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {import('fastify').RouteOptions}
 */
module.exports.getKeyInfo = (fastify) => ({
  url: '/auth/keys/info',
  method: 'GET',
  preValidation: fastify.auth([
    fastify.authPipeFactory({ allowSession: false }),
    fastify.authGuardFactory({ authMethod: 'apiKey' }),
  ]),
  handler: async (request, reply) => {
    const authInfo = await executeInfoQuery(
      request.headers['x-api-key'].toString()
    );

    return reply.code(200).send(authInfo);
  },
  schema: {
    tags: ['auth'],
    description: 'Get information about the API key.',
    security: [{ apiKeyAuth: [] }],
    headers: { $ref: 'ApiKeyHeader#' },
    response: {
      200: {
        type: 'object',
        properties: {
          user: { $ref: 'User#' },
          keyInfo: { $ref: 'Key#' },
        },
        required: ['user', 'keyInfo'],
      },
      404: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Key not found or not available' },
        },
        required: ['message'],
      },
      500: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Failed to retrieve key info',
          },
        },
        required: ['message'],
      },
    },
  },
});
