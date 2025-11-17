const { logger } = require('./logger');

/**
 * A map to hold initialized infrastructure components.
 * @type {Map<string, {testConnection: Function, closeConnection: Function, $db: any}>}
 */
const infrastructureMap = new Map();

/**
 * Bootstraps the infrastructure components of the application.
 * Ensures all critical services are initialized before the app starts.
 */
const bootstrapInfra = async () => {
  try {
    logger.info('🚀 Initializing infrastructure...');

    // Test PostgreSQL connection
    logger.info('🐘 Testing PostgreSQL connection...');
    const pgAdapter = require('./adapters/postgres');
    await pgAdapter.testConnection();

    infrastructureMap.set('postgres', pgAdapter);

    logger.info('✅ PostgreSQL connection established.');

    // Test MongoDB connection
    logger.info('🌱 Testing MongoDB connection...');
    const mongoAdapter = require('./adapters/mongo');
    await mongoAdapter.testConnection();

    infrastructureMap.set('mongo', mongoAdapter);

    logger.info('✅ MongoDB connection established.');

    // Test Redis connection
    logger.info('🧠 Testing Redis connection...');
    const redisAdapter = require('./adapters/redis');
    await redisAdapter.testConnection();

    infrastructureMap.set('redis', redisAdapter);

    logger.info('✅ Redis connection established.');

    logger.info('🎉 Infrastructure initialized successfully.');
  } catch (error) {
    logger.error(error, '💢 Failed to initialize infrastructure');
    throw error; // Exit the application if infra bootstrap fails
  }
};

const shutdownInfra = async () => {
  try {
    logger.info('Shutting down infrastructure...');

    // Close PostgreSQL connection
    if (infrastructureMap.has('postgres')) {
      await infrastructureMap.get('postgres').closeConnection();
      logger.info('PostgreSQL connection closed.');
    }

    // Close MongoDB connection
    if (infrastructureMap.has('mongo')) {
      await infrastructureMap.get('mongo').closeConnection();
      logger.info('MongoDB connection closed.');
    }

    // Close Redis connection
    if (infrastructureMap.has('redis')) {
      await infrastructureMap.get('redis').closeConnection();
      logger.info('Redis connection closed.');
    }

    logger.info('Infrastructure shutdown complete.');
  } catch (error) {
    logger.error(error, 'Error during infrastructure shutdown');
  }
};

module.exports = {
  isInitialized: () => infrastructureMap.size > 0,
  bootstrapInfra,
  shutdownInfra,
};
