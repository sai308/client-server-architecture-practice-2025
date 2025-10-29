const { httpError } = require('@/errors');

const { usersRepository } = require('@/repositories/users');
const { sessionsRepository } = require('@/repositories/sessions');

const { authService } = require('@/services/auth');

/**
 * Login user with username and password
 * @param {string} username
 * @param {string} password
 * @param {Services.DeviceInfo} deviceInfo
 */
module.exports.executeLogin = async (username, password, deviceInfo) => {
  try {
    const userCandidate = await usersRepository.findByUsername(username);

    if (!userCandidate) {
      throw httpError(404, 'Authentication failed. Maybe user does not exist.');
    }

    const authenticatedUser = await authService.authenticate(
      userCandidate,
      password
    );

    if (!authenticatedUser) {
      throw httpError(401, 'Authentication failed. Invalid credentials.');
    }

    const { session, user: sessionUser } = await authService.authorize(
      authenticatedUser,
      deviceInfo
    );

    const sessionRecord = await sessionsRepository.upsert(session);

    return {
      session: sessionRecord,
      user: sessionUser,
    };
  } catch (error) {
    throw httpError(error.statusCode || 500, 'Login process failed', error);
  }
};
