const { randomUUID } = require('node:crypto');
const bcrypt = require('bcrypt');

const { User } = require('@/domains/user');
const { Session } = require('@/domains/session');

const { makeFingerprint } = require('@/services/auth/fingerprint');

/**
 * @implements {Services.AuthService}
 */
class AuthService {
  /**
   * Create a new user session
   * @param {Services.AuthenticatedUser} user
   * @returns {Domain.SessionEntity}
   */
  #createUserSession(user, deviceInfo = {}) {
    const sessionId = randomUUID();

    const { fingerprint, normalizedUA } = makeFingerprint(
      deviceInfo.ipAddress || '',
      deviceInfo.userAgent || ''
    );

    const session = new Session({
      id: sessionId,
      userId: user.id,
      fp: fingerprint,
      userAgent: normalizedUA,
      ipAddress: deviceInfo.ipAddress,
    });

    return session;
  }

  /**
   * Generate a password hash for a given password
   * @param {string} password
   */
  async #generatePasswordHash(password) {
    const passwordHash = await bcrypt.hash(password, 10);

    return passwordHash;
  }

  /**
   * @type {Services.AuthService['authenticate']}
   */
  async authenticate(user, password, silent = false) {
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (silent) return null;

    if (!valid) throw new Error('Invalid credentials');

    // Remove sensitive data after successful authentication
    user.passwordHash = null;

    return new User(user);
  }

  /**
   * @type {Services.AuthService['authorize']}
   */
  async authorize(user, deviceInfo) {
    return {
      session: this.#createUserSession(user, deviceInfo),
      user,
    };
  }

  /**
   * @type {Services.AuthService['register']} user
   */
  async register(user) {
    const { password } = user;

    const newUser = new User({
      name: user.name,
      age: user.age,
      email: user.email,
      username: user.username,
      passwordHash: await this.#generatePasswordHash(password),
    });

    return newUser;
  }

  /**
   * @type {Services.AuthService['login']} user
   */
  async login(user, password, deviceInfo) {
    const authenticatedUser = await this.authenticate(user, password);

    return await this.authorize(authenticatedUser, deviceInfo);
  }

  /**
   * @type {Services.AuthService['hideSensitiveData']}
   */
  hideSensitiveData(userRecord) {
    const { passwordHash, ...safeUser } = userRecord;

    return safeUser;
  }
}

module.exports = { authService: new AuthService() };
