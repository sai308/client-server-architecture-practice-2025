const { getKeyInfo } = require('@/routes/auth/key/info');
const { createApiKey } = require('@/routes/auth/key');

const { register } = require('@/routes/auth/register');
const { getAuthInfo } = require('@/routes/auth/info');
const { logout } = require('@/routes/auth/logout');
const { login } = require('@/routes/auth/login');

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} _opts
 */
module.exports.authRouter = async function (fastify, _opts) {
  fastify.route(getAuthInfo(fastify));
  fastify.route(register(fastify));
  fastify.route(logout(fastify));
  fastify.route(login(fastify));

  fastify.route(getKeyInfo(fastify));
  fastify.route(createApiKey(fastify));
};
