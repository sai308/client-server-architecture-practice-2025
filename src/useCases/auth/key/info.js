const { httpError } = require('@/errors');

const { apiKeysRepository } = require('@/repositories/apiKeys');
const { usersRepository } = require('@/repositories/users');
const { authService } = require('@/services/auth');

/**
 * @param {string} keyValue
 */
module.exports.executeInfoQuery = async (keyValue) => {
  try {
    const apiKey = await apiKeysRepository.findByValue(keyValue);

    if (!apiKey) {
      throw httpError(404, 'Key not found or not available');
    }

    const user = await usersRepository.findById(apiKey.ownerId);

    const safeUser = authService.hideSensitiveData(user);

    return {
      user: safeUser,
      keyInfo: {
        id: apiKey.id,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
        updatedAt: apiKey.updatedAt,
        lastUsedAt: new Date(),
      },
    };
  } catch (error) {
    throw httpError(500, 'Failed to retrieve key info', error);
  }
};
