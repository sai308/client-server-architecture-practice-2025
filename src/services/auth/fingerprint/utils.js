/* eslint-disable no-sparse-arrays */
/** Base64url without padding */
module.exports.b64url = (buf) => {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

/** IPv4 -> /24, IPv6 -> /64; returns normalized string */
module.exports.normalizeIp = (ip) => {
  if (!ip) return 'ip:none';
  // Remove IPv6 prefix for IPv4-mapped addresses ::ffff:127.0.0.1
  ip = ip.replace(/^::ffff:/i, '');
  // Strip port if present
  ip = ip.replace(/:\d+$/, '');

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    // IPv4: keep /24
    const [a, b, c] = ip.split('.');
    return `v4:${a}.${b}.${c}.0/24`;
  }

  // IPv6: collapse to /64 (first 4 hextets)
  if (ip.includes(':')) {
    // Expand minimal: split, pad groups; we only need first 4 groups
    const parts = ip.split(':');
    // Handle :: compression
    const missing = 8 - parts.filter(Boolean).length;
    const expanded = [];
    for (const p of parts) {
      if (p === '') {
        for (let i = 0; i < missing + 1; i++) expanded.push('0');
      } else {
        expanded.push(p);
      }
    }
    const first4 = expanded
      .slice(0, 4)
      .map((h) => h.padStart(4, '0').toLowerCase());
    return `v6:${first4.join(':')}::/64`;
  }

  return `ip:unknown`;
};

/** Very light UA normalization (family + major) */
module.exports.normalizeUa = (uaRaw) => {
  if (!uaRaw) return 'ua:none';
  const ua = String(uaRaw).toLowerCase();

  // Crude family detection
  const family =
    ua.includes('chrome') && !ua.includes('edg/')
      ? 'chrome'
      : ua.includes('edg/')
        ? 'edge'
        : ua.includes('firefox')
          ? 'firefox'
          : ua.includes('safari') && !ua.includes('chrome')
            ? 'safari'
            : ua.includes('curl')
              ? 'curl'
              : ua.includes('postman')
                ? 'postman'
                : 'other';

  // Extract the version token we care about
  let version = '0';
  if (family === 'chrome') version = (ua.match(/chrome\/(\d+)/) || [, '0'])[1];
  if (family === 'edge') version = (ua.match(/edg\/(\d+)/) || [, '0'])[1];
  if (family === 'firefox') {
    version = (ua.match(/firefox\/(\d+)/) || [, '0'])[1];
  }
  if (family === 'safari') version = (ua.match(/version\/(\d+)/) || [, '0'])[1];
  if (family === 'curl') version = (ua.match(/curl\/(\d+)/) || [, '0'])[1];
  if (family === 'postman') {
    version = (ua.match(/postmanruntime\/(\d+)/) || [, '0'])[1];
  }

  return `${family}:${version}`;
};
