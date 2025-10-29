const { executeRegistration } = require('@/useCases/auth/register');
const { setSessionCookie } = require('@/handlers/auth/sessionCookie');
const { resolveClientIP } = require('@/handlers/auth/processing/utils');

/**
 * @description Route to create new user with subsequent auth.
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {import('fastify').RouteOptions}
 */
module.exports.register = (fastify) => ({
  url: '/auth/register',
  method: 'POST',
  preValidation: fastify.auth([
    fastify.authPipeFactory(),
    fastify.guestGuardFactory({
      redirectPath: '/api/auth/info',
      statusCode: 303,
    }),
  ]),
  handler: async (request, reply) => {
    const payload = /**
     * @type {Services.UserRegCandidate}
     */ (request.body);

    const deviceInfo = {
      ipAddress: resolveClientIP(request),
      userAgent: request.headers['user-agent'] || 'unknown',
    };

    const sessionData = await executeRegistration(payload, deviceInfo);

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
      required: ['username', 'password', 'email', 'name', 'age'],
      additionalProperties: false,
      properties: {
        username: { type: 'string', minLength: 3, maxLength: 32 },
        password: { type: 'string', minLength: 6, maxLength: 64 },
        age: { type: 'integer', minimum: 6, maximum: 128 },
        name: { type: 'string', minLength: 1, maxLength: 64 },
        email: { type: 'string', format: 'email', maxLength: 128 },
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
      500: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Registration process failed.',
          },
        },
        required: ['message'],
      },
    },
  },
});
