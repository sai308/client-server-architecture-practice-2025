const { session } = require('@/config');

const {
  sessionStrategy,
} = require('@/handlers/auth/processing/strategies/session');

const { apiKeyStrategy } = require('@/handlers/auth/processing/strategies/key');

/**
 * @description Factory to create an authentication pipe pre-handler.
 * Allows configuration of permitted authentication methods. Authenticates
 * the request and populates requestContext with authData if successful.
 * @param {Auth.PipeConfig} config
 */
module.exports.authPipeFactory = (config = {}) => {
  const { allowSession = true, allowApiKey = true } = config;
  if (!allowSession && !allowApiKey) {
    throw new Error('At least one authentication method must be allowed.');
  }

  /**
   * @type {import('fastify').preHandlerAsyncHookHandler}
   */
  return async function (request) {
    if (allowSession && !request.requestContext.get('authData')) {
      try {
        const cookieValue = request.cookies?.[session.COOKIE_NAME];

        if (cookieValue) {
          const authData = await sessionStrategy(cookieValue, request);

          request.requestContext.set('authData', {
            ...authData,
            method: 'session',
          });

          return;
        }
      } catch (error) {
        request.log.error(error, 'Error while processing the session cookie');
      }
    }

    const apiKey = request.headers['x-api-key'];

    if (allowApiKey && apiKey) {
      try {
        const authData = await apiKeyStrategy(apiKey.toString(), request);

        request.requestContext.set('authData', {
          ...authData,
          method: 'apiKey',
          sessionId: null,
        });
      } catch (error) {
        request.log.error(error, 'Error while processing the API key');
      }
    }
  };
};
