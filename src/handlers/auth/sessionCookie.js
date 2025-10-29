const { env, session } = require('@/config');

/**
 * @param {{
 *  sessionId: string,
 *  userId: number
 * }} sessionData
 * @param {import('fastify').FastifyReply} reply
 */
module.exports.setSessionCookie = (sessionData, reply) => {
  if (sessionData && sessionData.sessionId && sessionData.userId) {
    const { userId, sessionId } = sessionData;

    // Minimal cookie payload — keep it small (<4KB total cookie header)
    const cookieJson = {
      userId,
      sessionId,
    };

    // Encode JSON to avoid odd chars; signed cookies expect a string
    const cookieValue = Buffer.from(JSON.stringify(cookieJson)).toString(
      'base64url'
    );

    reply.setCookie(session.COOKIE_NAME, cookieValue, {
      path: '/',
      httpOnly: true,
      secure: true, // required on HTTPS; always set in prod
      sameSite: session.SAME_SITE, // same-origin docs+API → 'lax' is fine
      domain: env.COOKIE_DOMAIN,
      // if your docs are on a different origin and you need cross-site requests:
      // sameSite: 'none', secure: true
      maxAge: session.SESSION_AGE,
      signed: true, // <- uses plugin secret to append signature
    });
  } else {
    reply.log.warn(
      'Attempted to set session cookie with invalid session data. Cookie not set.'
    );
  }
};

/** @type {import('fastify').preValidationAsyncHookHandler} */
module.exports.authFromCookie = async (request, reply) => {
  const raw = request.cookies?.[session.COOKIE_NAME];

  if (!raw) {
    return reply
      .code(401)
      .send({ error: 'Unauthorized', message: 'No cookie' });
  }

  // verify signature and extract original value
  const { valid, value } = request.unsignCookie(raw);

  if (!valid) {
    return reply
      .code(401)
      .send({ error: 'Unauthorized', message: 'Bad signature' });
  }

  let parsed;
  try {
    parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
  } catch {
    return reply
      .code(400)
      .send({ error: 'BadRequest', message: 'Malformed cookie' });
  }

  return {
    userId: parsed.userId,
    sessionId: parsed.sessionId,
  };
};

/**
 * @param {import('fastify').FastifyReply} reply
 */
module.exports.clearSessionCookie = (reply) => {
  reply.clearCookie(session.COOKIE_NAME, {
    path: '/',
    sameSite: session.SAME_SITE,
    domain: env.COOKIE_DOMAIN,
  });
};
