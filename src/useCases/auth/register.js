const { httpError } = require('@/errors');

const { usersRepository } = require('@/repositories/users');
const { sessionsRepository } = require('@/repositories/sessions');

const { authService } = require('@/services/auth');

/**
 * @param {Services.UserRegCandidate} userCandidate
 * @param {Services.DeviceInfo} deviceInfo
 */
module.exports.executeRegistration = async (userCandidate, deviceInfo) => {
  try {
    const user = await authService.register(userCandidate);

    const savedUser = await usersRepository.materialize(user);

    // We can add email confirmation step here later
    // For now, we directly authorize the user after registration

    const { session, user: sessionUser } = await authService.authorize(
      savedUser,
      deviceInfo
    );

    const sessionRecord = await sessionsRepository.upsert(session);

    return {
      session: sessionRecord,
      user: sessionUser,
    };
  } catch (error) {
    throw httpError(500, 'Registration process failed.', error);
  }
};
