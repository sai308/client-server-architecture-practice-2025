const { executeLogin } = require('@/useCases/auth/login');
const { setSessionCookie } = require('@/handlers/auth/sessionCookie');
const { resolveClientIP } = require('@/handlers/auth/processing/utils');

/**
 * @description Route to authenticate & authorize user.
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {import('fastify').RouteOptions}
 */
module.exports.login = (fastify) => ({
  url: '/auth/login',
  method: 'POST',
  preValidation: fastify.auth([
    fastify.authPipeFactory(),
    fastify.guestGuardFactory({
      redirectPath: '/api/auth/info',
      statusCode: 302,
    }),
  ]),
  handler: async (request, reply) => {
    const payload = /**
     * @type {Services.UserLoginCandidate}
     */ (request.body);

    const deviceInfo = {
      ipAddress: resolveClientIP(request),
      userAgent: request.headers['user-agent'] || 'unknown',
    };

    const sessionData = await executeLogin(
      payload.username,
      payload.password,
      deviceInfo
    );

    setSessionCookie(
      {
        sessionId: sessionData.session.id,
        userId: sessionData.user.id,
      },
      reply
    );

    return reply.code(201).send(sessionData);
  },
  schema: {
    tags: ['auth'],
    description: 'Authenticate user and create a new session.',
    body: {
      type: 'object',
      required: ['username', 'password'],
      additionalProperties: false,
      properties: {
        username: { type: 'string', minLength: 3, maxLength: 32 },
        password: { type: 'string', minLength: 6, maxLength: 64 },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          user: { $ref: 'User#' },
          session: { $ref: 'Session#' },
        },
        required: ['user', 'session'],
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
            example: 'Login process failed.',
          },
        },
        required: ['message'],
      },
    },
  },
});
