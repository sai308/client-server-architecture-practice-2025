const { describe, test } = require('node:test');
const assert = require('node:assert/strict');

const { apiKeyService } = require('@/services/auth/key');

describe('API Key Service', () => {
  test('#generateKeyValue - default prefix and version', () => {
    const key = apiKeyService.generateKeyValue();
    // Should follow pattern: <prefix>.v<version>.<base64url>
    assert.ok(
      /^pk\.v1\.[A-Za-z0-9_-]+$/.test(key),
      `invalid key format: ${key}`
    );
  });

  test('#generateKeyValue - custom prefix (version remains default)', () => {
    const key = apiKeyService.generateKeyValue('sk');
    assert.ok(
      /^sk\.v1\.[A-Za-z0-9_-]+$/.test(key),
      `invalid key format: ${key}`
    );
  });

  test('#generateKeyValue - produces unique values', () => {
    const a = apiKeyService.generateKeyValue();
    const b = apiKeyService.generateKeyValue();
    // Very small chance of collision; assert they are different
    assert.notStrictEqual(a, b);
  });

  test('#createKey - returns object with expected fields', () => {
    const ownerId = 42;
    const record = apiKeyService.createKey(ownerId);

    assert.strictEqual(typeof record.key, 'string');
    assert.strictEqual(record.lastUsedAt, null);
    assert.strictEqual(record.isActive, true);
    assert.strictEqual(record.ownerId, ownerId);

    // the key value itself should be valid
    assert.ok(
      /^pk\.v1\.[A-Za-z0-9_-]+$/.test(record.key),
      `invalid key format: ${record.key}`
    );
  });
});
