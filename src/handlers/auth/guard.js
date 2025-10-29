/**
 * @description Factory to create an authentication guard pre-handler.
 * Validates user authentication and optional privileges or methods.
 */
module.exports.authGuardFactory = ({
  isPrivilegeRequired = false,
  authMethod = null,
} = {}) =>
  /**
   * @type {import('fastify').preHandlerAsyncHookHandler}
   */
  (
    async function (request, reply) {
      const authData = request.requestContext.get('authData');

      if (!authData?.user) {
        return reply
          .code(401)
          .send({ error: 'Unauthorized: No valid authorization data found' });
      }

      if (isPrivilegeRequired && !authData.user.isPrivileged) {
        return reply.code(403).send({
          error: 'Forbidden: Only privileged users can access this resource',
        });
      }

      if (authMethod && authData.method !== authMethod) {
        return reply
          .code(403)
          .send({
            error: `Forbidden: This resource requires "${authMethod}" authentication`,
          });
      }
    }
  );

/**
 * @description Factory to create a guest guard pre-handler.
 * Redirects authenticated users to a specified path.
 */
module.exports.guestGuardFactory = ({ redirectPath = '/', statusCode = 302 }) =>
  /**
   * @type {import('fastify').preHandlerAsyncHookHandler}
   */
  (
    async function (request, reply) {
      const authData = request.requestContext.get('authData');

      if (authData?.user) {
        return reply.redirect(redirectPath, statusCode);
      }
    }
  );
