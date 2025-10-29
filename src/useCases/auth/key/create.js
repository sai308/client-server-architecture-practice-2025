const { httpError } = require('@/errors');

const { usersRepository } = require('@/repositories/users');
const { apiKeysRepository } = require('@/repositories/apiKeys');

const { apiKeyService } = require('@/services/auth/key');

/**
 * Create a new API key for the authenticated user.
 * @param {number} userId
 */
module.exports.executeKeyCreation = async (userId) => {
  try {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw httpError(403, 'Authorization failed. Not enough permissions.');
    }

    const newApiKey = await apiKeysRepository.create(
      apiKeyService.createKey(userId)
    );

    return newApiKey;
  } catch (error) {
    throw httpError(error.statusCode || 500, 'Failed to create API key', error);
  }
};
