const crypto = require('node:crypto');
const { env } = require('@/config');

const {
  b64url,
  normalizeIp,
  normalizeUa,
} = require('@/services/auth/fingerprint/utils');

const PEPPER = env.FP_PEPPER; // 32+ random bytes (base64 or hex)

module.exports.makeFingerprint = (ipAddress, userAgent) => {
  if (!PEPPER) throw new Error('FP_PEPPER is not set');

  const ipNorm = normalizeIp(ipAddress);
  const uaNorm = normalizeUa(userAgent);
  const data = `${ipNorm}|${uaNorm}`;

  const hmac = crypto
    .createHmac(
      'sha256',
      Buffer.from(PEPPER, /[^A-Fa-f0-9]/.test(PEPPER) ? 'base64' : 'hex')
    )
    .update(data, 'utf8')
    .digest();

  // 8-12 bytes is plenty for bucket IDs; tune length as you like
  const short = hmac.subarray(0, 12);

  return {
    fingerprint: b64url(short), // e.g. "c7bP3w1g0v8c7A3e"
    normalizedUA: uaNorm,
  };
};
