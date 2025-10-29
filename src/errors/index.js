const createError = require('@fastify/error');
const { STATUS_CODES } = require('node:http');

/**
 * Base class for legacy-API compatibility. Has code "HTTP_EXCEPTION".
 * You can keep throwing `new HttpException(404, '...')` if you want.
 */
const BaseHttp = createError('HTTP_EXCEPTION', '%s');

class HttpException extends BaseHttp {
  /**
   * @param {number} statusCode
   * @param {string} [message]
   * @param {Error}  [cause]
   */
  constructor(statusCode, message, cause) {
    super(message ?? STATUS_CODES[statusCode] ?? 'Error');

    this.statusCode = statusCode;

    if (cause) this.cause = cause;
  }
}

/**
 * Cached map of per-status error classes so each has a stable .code like "HTTP_404".
 * This is the recommended way going forward.
 */
const _cache = new Map();

/**
 * Factory: return an Error instance with .code="HTTP_<status>" and .statusCode=<status>.
 * @param {number} statusCode
 * @param {string} [message]
 * @param {Error}  [cause]
 * @returns {Error}
 */
function httpError(statusCode, message, cause) {
  if (!_cache.has(statusCode)) {
    // Use "%s" so the actual message is passed at construction time.
    const _class = createError(`HTTP_${statusCode}`, '%s', statusCode);

    _cache.set(statusCode, _class);
  }

  const _class = _cache.get(statusCode);

  const msg = message ?? STATUS_CODES[statusCode] ?? 'Error';
  const err = new _class(msg);

  if (cause) err.cause = cause;

  return err;
}

module.exports = { HttpException, httpError, STATUS_CODES };
