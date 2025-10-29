const { httpError } = require('@/errors');

const { sessionsRepository } = require('@/repositories/sessions');

/**
 * Logout user by invalidating the session.
 * @param {string} sessionId
 */
module.exports.executeLogout = async (sessionId) => {
  try {
    const sessionRecord = await sessionsRepository.delete(sessionId);

    if (!sessionRecord) {
      throw httpError(404, 'Session not found');
    }
  } catch (error) {
    throw httpError(500, 'Logout process failed.', error);
  }
};
