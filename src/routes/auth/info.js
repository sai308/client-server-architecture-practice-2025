const { executeInfoQuery } = require('@/useCases/auth/getInfo');

/**
 * @description Route to get authenticated user info.
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {import('fastify').RouteOptions}
 */
module.exports.getAuthInfo = (fastify) => ({
  url: '/auth/info',
  method: 'GET',
  preValidation: fastify.auth([
    fastify.authPipeFactory({ allowApiKey: false }),
    fastify.authGuardFactory({ authMethod: 'session' }),
  ]),
  handler: async (request, reply) => {
    const userAuthData = request.requestContext.get('authData');

    const authInfo = await executeInfoQuery(
      userAuthData.user.id,
      userAuthData.sessionId
    );

    return reply.code(200).send(authInfo);
  },
  schema: {
    tags: ['auth'],
    description: 'Get information about the authenticated user.',
    security: [{ cookieAuth: [] }],
    response: {
      200: {
        type: 'object',
        properties: {
          user: { $ref: 'User#' },
          session: { $ref: 'Session#' },
        },
        required: ['user', 'session'],
      },
      404: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Session not found' },
        },
        required: ['message'],
      },
      500: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Failed to retrieve session info.',
          },
        },
        required: ['message'],
      },
    },
  },
});
