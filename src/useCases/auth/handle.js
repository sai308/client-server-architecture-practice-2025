const { httpError } = require('@/errors');
const { logger } = require('@/logger');

const { usersRepository } = require('@/repositories/users');
const { apiKeysRepository } = require('@/repositories/apiKeys');

const { authService } = require('@/services/auth');

/**
 * @param {number} userId
 * @param {string} sessionId
 * @param {{
 *  ipAddress: string,
 *   userAgent: string,
 * }} deviceInfo
 */
module.exports.handleSessionAuth = async (userId, sessionId, deviceInfo) => {
  try {
    const userWithSession = await usersRepository.findByIdWithTargetSession(
      userId,
      sessionId
    );

    if (!userWithSession) {
      throw httpError(403, 'Session not valid or has expired');
    }

    const { session, ...user } = userWithSession;

    if (session.ipAddress !== deviceInfo.ipAddress) {
      logger.warn(
        `IP address mismatch for session ${sessionId} of user ${userId}: expected ${session.ipAddress}, got ${deviceInfo.ipAddress}. User agent: ${deviceInfo.userAgent}`
      );
    }

    const safeUser = authService.hideSensitiveData(user);

    return safeUser;
  } catch (error) {
    throw httpError(500, 'Failed to retrieve session info.', error);
  }
};

/**
 * Handle API key authentication.
 * @param {string} apiKey
 */
module.exports.handleApiKeyAuth = async (apiKey) => {
  try {
    const apiKeyRecord = await apiKeysRepository.findByValue(apiKey);

    if (!apiKeyRecord) {
      throw httpError(403, 'API key not valid or disabled');
    }

    if (!apiKeyRecord.isActive) {
      throw httpError(403, 'API key is disabled');
    }

    const ownerRecord = await usersRepository.findById(apiKeyRecord.ownerId);

    const safeUser = authService.hideSensitiveData(ownerRecord);

    return safeUser;
  } catch (error) {
    throw httpError(500, 'Failed to retrieve session info.', error);
  }
};
