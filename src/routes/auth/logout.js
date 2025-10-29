const { executeLogout } = require('@/useCases/auth/logout');
const { clearSessionCookie } = require('@/handlers/auth/sessionCookie');

/**
 * @description Route to destroy current session.
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {import('fastify').RouteOptions}
 */
module.exports.logout = (fastify) => ({
  url: '/auth/logout',
  method: 'POST',
  preValidation: fastify.auth([fastify.authPipeFactory()]),
  handler: async (request, reply) => {
    const userAuthData = request.requestContext.get('authData');

    if (!userAuthData?.sessionId) {
      // No session to logout from
      return reply.code(200).send({ message: 'No active session found.' });
    }

    if (userAuthData?.method !== 'session') {
      return reply
        .code(403)
        .send(
          'Forbidden: Logout is only supported for session-based authentication.'
        );
    }

    await executeLogout(userAuthData.sessionId);

    clearSessionCookie(reply);

    return reply.code(204).send();
  },
  schema: {
    tags: ['auth'],
    description: 'Logout from user session.',
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'No active session found.' },
        },
        required: ['message'],
      },
      204: {
        type: 'null',
        description: 'No Content - Successful logout with no response body.',
      },
      401: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Authentication failed. Invalid credentials.',
          },
        },
        required: ['message'],
      },
      500: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Logout process failed.',
          },
        },
        required: ['message'],
      },
    },
  },
});
