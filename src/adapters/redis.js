const { Redis } = require('ioredis');

const { env } = require('@/config');

const redis = new Redis(env.REDIS_URL);

// Utility function to test the database connection
const testConnection = async () => {
  await redis.ping('PING'); // Simple query to test connection
};

const closeConnection = async () => {
  await redis.quit();
};

module.exports = {
  closeConnection,
  testConnection,
  $db: redis,
};
