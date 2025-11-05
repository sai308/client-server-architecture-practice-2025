const { test, describe, mock } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');

function makeUserRecord(fields = {}) {
  return Object.assign(
    {
      id: 1,
      name: 'Alice',
      age: 30,
      email: 'alice@example.com',
      balance: 0,
      username: 'alice',
      passwordHash: null,
      isPrivileged: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    fields
  );
}

describe('Auth Service', () => {
  test('#authenticate - throws when user is missing', async () => {
    const { authService } = require('@/services/auth');

    await assert.rejects(async () => authService.authenticate(null, 'x'), {
      message: 'User not found',
    });
  });

  test('#authenticate - invalid credentials throw', async () => {
    const { authService } = require('@/services/auth');

    const hash = await bcrypt.hash('correct-password', 10);
    const user = makeUserRecord({ passwordHash: hash });

    await assert.rejects(async () => authService.authenticate(user, 'wrong'), {
      message: 'Invalid credentials',
    });
  });

  test('#authenticate - silent mode returns null', async () => {
    const { authService } = require('@/services/auth');

    const hash = await bcrypt.hash('secret', 10);
    const user = makeUserRecord({ passwordHash: hash });

    // @ts-ignore - mocked data
    const result = await authService.authenticate(user, 'secret', true);
    assert.strictEqual(result, null);
  });

  test('#authenticate - successful returns user without passwordHash', async () => {
    const { authService } = require('@/services/auth');

    const hash = await bcrypt.hash('s3cr3t', 10);
    const userRec = makeUserRecord({ id: 99, passwordHash: hash });

    const user = await authService.authenticate(userRec, 's3cr3t');

    // @ts-ignore - mocked data
    assert.strictEqual(user.passwordHash, null);
    assert.strictEqual(user.id, 99);
    assert.strictEqual(user.username, userRec.username);
  });

  test('#authorize - creates a session and returns user (mock fingerprint)', async () => {
    // Patch fingerprint module before requiring auth service
    const fingerprintMod = require('@/services/auth/fingerprint');
    const origMakeFingerprint = fingerprintMod.makeFingerprint;

    fingerprintMod.makeFingerprint = mock.fn(() => ({
      fingerprint: 'fixed-fp',
      normalizedUA: 'curl:7',
    }));

    // Clear auth service cache and require fresh to pick up mocked fingerprint
    delete require.cache[require.resolve('@/services/auth')];
    const { authService } = require('@/services/auth');

    try {
      const authUser = {
        id: 7,
        name: 'Bob',
        username: 'bob',
        age: 40,
        email: 'bob@example.com',
        balance: 0,
        isPrivileged: false,
      };

      const deviceInfo = { ipAddress: '127.0.0.1', userAgent: 'curl/7.79.1' };

      const { session, user } = await authService.authorize(
        authUser,
        deviceInfo
      );

      assert.strictEqual(user, authUser);
      assert.strictEqual(session.userId, authUser.id);
      assert.strictEqual(session.ipAddress, deviceInfo.ipAddress);
      assert.strictEqual(session.fp, 'fixed-fp');
      assert.strictEqual(session.userAgent, 'curl:7');
    } finally {
      // Restore original fingerprint function
      fingerprintMod.makeFingerprint = origMakeFingerprint;
      delete require.cache[require.resolve('@/services/auth')];
    }
  });

  test('#register - hashes password and returns user entity (mock bcrypt.hash)', async () => {
    // Mock bcrypt.hash before requiring auth service
    const origHash = bcrypt.hash;
    const mockBcryptHash = mock.fn(async () => 'fake-hash-123');
    bcrypt.hash = mockBcryptHash;

    // Clear auth service cache and require fresh to pick up mocked bcrypt
    delete require.cache[require.resolve('@/services/auth')];
    const { authService } = require('@/services/auth');

    try {
      const candidate = {
        name: 'Charlie',
        age: 28,
        email: 'charlie@example.com',
        username: 'charlie',
        password: 'my-password',
        balance: 0,
      };

      const created = await authService.register(candidate);

      assert.strictEqual(created.name, candidate.name);
      assert.strictEqual(created.username, candidate.username);
      assert.strictEqual(created.isPrivileged, false);
      assert.strictEqual(created.passwordHash, 'fake-hash-123');
      assert.notStrictEqual(created.passwordHash, candidate.password);
    } finally {
      // Restore original bcrypt.hash
      bcrypt.hash = origHash;
      delete require.cache[require.resolve('@/services/auth')];
    }
  });

  test('#login - authenticates and returns session+user (mock fingerprint)', async () => {
    // Mock the fingerprint module
    const fingerprintMod = require('@/services/auth/fingerprint');
    const origMakeFingerprint = fingerprintMod.makeFingerprint;

    fingerprintMod.makeFingerprint = mock.fn(() => ({
      fingerprint: 'fp-2',
      normalizedUA: 'node/test',
    }));

    // Clear auth service cache and require fresh to pick up mocked fingerprint
    delete require.cache[require.resolve('@/services/auth')];
    const { authService } = require('@/services/auth');

    try {
      const plain = 'login-pass';
      const hash = await bcrypt.hash(plain, 10);
      const userRec = makeUserRecord({ id: 123, passwordHash: hash });

      const deviceInfo = { ipAddress: '::1', userAgent: 'node/test' };

      const { session, user } = await authService.login(
        userRec,
        plain,
        deviceInfo
      );

      assert.strictEqual(user.id, userRec.id);
      assert.strictEqual(session.userId, userRec.id);
      assert.strictEqual(session.fp, 'fp-2');
    } finally {
      // Restore original fingerprint function
      fingerprintMod.makeFingerprint = origMakeFingerprint;
      delete require.cache[require.resolve('@/services/auth')];
    }
  });

  test('#hideSensitiveData - removes passwordHash', () => {
    const { authService } = require('@/services/auth');

    const rec = makeUserRecord({ passwordHash: 'secret-hash', id: 5 });
    const safe = authService.hideSensitiveData(rec);

    // @ts-ignore - mocked data
    assert.strictEqual(safe.passwordHash, undefined);
    assert.strictEqual(safe.id, rec.id);
    assert.strictEqual(safe.username, rec.username);
  });
});
