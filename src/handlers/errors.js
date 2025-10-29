const { findPgError, pgErrorToHttp } = require('@/adapters/postgres/errors');
const { STATUS_CODES, httpError } = require('@/errors');
const { env } = require('@/config');

/**
 * Patch the routing of the fastify instance
 * @param {import("fastify").FastifyInstance} fastify
 */
module.exports.patchErrorHandling = (fastify) => {
  // Handle 404 responses
  fastify.setNotFoundHandler((request, reply) => {
    throw httpError(
      404,
      `Route ${request.method} ${request.raw.url} not found`
    );
  });

  // Add a global error handler if needed
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error); // Log the error

    if (
      error.code === 'FST_ERR_VALIDATION' ||
      error.validation ||
      'serialization' in error
    ) {
      return reply
        .status(error.statusCode || 400)
        .send({ error: `Invalid request: ${error.message}` });
    }

    const { status: pgStatusCode } = pgErrorToHttp(findPgError(error));

    const status =
      pgStatusCode ||
      (Number.isInteger(error.statusCode) ? error.statusCode : 500);

    // Prefer stable programmatic codes
    const code = error.code || `HTTP_${status}`;

    reply
      .code(status)
      .type('application/json')
      .send({
        error: STATUS_CODES[status] ?? 'Error',
        code,
        message: error.message,
        // Optionally: include meta in non-prod
        ...(env.IS_DEV_ENV && {
          stack: error.stack,
          cause: JSON.stringify(error.cause, null, 4),
        }),
      });
  });
};
