const { httpError } = require('@/errors');

const { handleSessionAuth } = require('@/useCases/auth/handle');
const { resolveClientIP } = require('@/handlers/auth/processing/utils');

/**
 * Validate a session from a signed cookie. The cookie value must contain sessionId & userId. If the cookie is signed,
 * it will be unsign-validated using Fastify's unsignCookie helper.
 *
 * @param {string} cookieValue
 * @param {import('fastify').FastifyRequest} request
 */
module.exports.sessionStrategy = async (cookieValue, request) => {
  if (!cookieValue) throw httpError(401, 'Session cookie is required.');

  const rawValue = cookieValue;

  // verify signature and extract original value
  const { valid, value } = request.unsignCookie(rawValue);

  if (!valid) {
    throw new Error('Invalid session cookie signature.');
  }

  let parsed;

  try {
    parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
  } catch {
    throw new Error('Malformed session cookie payload.');
  }

  if (!parsed?.sessionId || !parsed?.userId) {
    throw new Error('Invalid session cookie payload.');
  }

  const resolvedIP = resolveClientIP(request);

  const authenticatedUser = await handleSessionAuth(
    parsed.userId,
    parsed.sessionId,
    {
      ipAddress: resolvedIP,
      userAgent: request.headers['user-agent'] || 'unknown',
    }
  );

  return {
    sessionId: parsed.sessionId,
    user: authenticatedUser,
    ipAddress: resolvedIP,
  };
};
