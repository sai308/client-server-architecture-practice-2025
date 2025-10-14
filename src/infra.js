const { logger } = require('./logger');

/**
 * A map to hold initialized infrastructure components.
 * @type {Map<string, {testConnection: Function, closeConnection: Function, db: any}>}
 */
const infrastructureMap = new Map();

/**
 * Bootstraps the infrastructure components of the application.
 * Ensures all critical services are initialized before the app starts.
 */
const bootstrapInfra = async () => {
  try {
    logger.info('Initializing infrastructure...');

    // Test PostgreSQL connection
    logger.info('Testing PostgreSQL connection...');
    const pgAdapter = require('./adapters/postgres');
    await pgAdapter.testConnection();

    logger.info('PostgreSQL connection established.');
    // Add other infrastructure components here if needed
    // Example: Redis, MongoDB, etc.

    logger.info('Infrastructure initialized successfully.');
  } catch (error) {
    logger.error('Failed to initialize infrastructure:', error);
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
  } catch (error) {
    logger.error('Error during infrastructure shutdown:', error);
  }
};

module.exports = {
  isInitialized: () => infrastructureMap.size > 0,
  bootstrapInfra,
  shutdownInfra,
};
