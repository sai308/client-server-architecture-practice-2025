declare namespace Services {
  type UserRegCandidate = Omit<Domain.User, 'passwordHash' | 'isPrivileged'> & {
    password: string;
  };

  type UserLoginCandidate = Pick<Domain.User, 'username'> & {
    password: string;
  };

  type DeviceInfo = {
    ipAddress: string;
    userAgent: string;
  };

  type UserWithId = Domain.User & { id: number };

  type AuthenticatedUser = Omit<UserWithId, 'passwordHash'>;

  type AuthMethod = 'session' | 'apiKey';

  interface AuthService {
    /**
     * Authenticate a user with their password
     */
    authenticate(
      user: Repositories.UserRecord,
      password: string,
      silent?: boolean
    ): Promise<AuthenticatedUser>;

    /**
     * Authorize a user for a specific action, returning session
     */
    authorize(
      user: AuthenticatedUser,
      deviceInfo?: DeviceInfo
    ): Promise<{ session: Domain.SessionEntity; user: AuthenticatedUser }>;

    /**
     * Hide sensitive data from a user record
     */
    hideSensitiveData(userRecord: Repositories.UserRecord): AuthenticatedUser;

    /**
     * Register a new user in the system with a hashed password
     */
    register(user: UserRegCandidate): Promise<Domain.UserEntity>;

    /**
     * Login a user by authenticating and authorizing them
     */
    login(
      user: Repositories.UserRecord,
      password: string,
      deviceInfo?: DeviceInfo
    ): Promise<{ session: Domain.Session; user: AuthenticatedUser }>;
  }
}
