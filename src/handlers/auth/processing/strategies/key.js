const { httpError } = require('@/errors');

const { handleApiKeyAuth } = require('@/useCases/auth/handle');
const { resolveClientIP } = require('../utils');

/**
 * @param {string} apiKey
 * @param {import('fastify').FastifyRequest} request
 */
module.exports.apiKeyStrategy = async (apiKey, request) => {
  if (!apiKey) throw httpError(401, 'API key is required.');

  const authenticatedUser = await handleApiKeyAuth(apiKey);

  const resolvedIP = resolveClientIP(request);

  return { user: authenticatedUser, ipAddress: resolvedIP };
};
