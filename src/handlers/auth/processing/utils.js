/**
 * @param {import('fastify').FastifyRequest} request
 */
module.exports.resolveClientIP = (request) => {
  const forwardedFor = request.headers['x-forwarded-for'];

  const xff = Array.isArray(forwardedFor)
    ? forwardedFor[0]?.split(',')[0]?.trim()
    : (forwardedFor || '').split(',')[0]?.trim();

  return xff || request.ip || request.socket?.remoteAddress || '';
};
