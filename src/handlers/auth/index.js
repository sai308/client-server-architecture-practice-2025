const { authPipeFactory } = require('@/handlers/auth/processing');
const {
  authGuardFactory,
  guestGuardFactory,
} = require('@/handlers/auth/guard');

/**
 * Patch the routing of the fastify instance
 * @param {import("fastify").FastifyInstance} fastify
 */
module.exports.patchAuth = async function (fastify) {
  fastify
    .decorate('authPipeFactory', authPipeFactory)
    .decorate('authGuardFactory', authGuardFactory)
    .decorate('guestGuardFactory', guestGuardFactory);
};
