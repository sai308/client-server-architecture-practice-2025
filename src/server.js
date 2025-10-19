require('module-alias/register');

const { env } = require('@/config');

// Import the bootstrapFastify function from app.js
const { bootstrapFastify } = require('@/app');

const infra = require('@/infra');

// Declare a variable to hold the Fastify instance
let fastify;

/**
 * Function to start the Fastify server
 */
const startServer = async () => {
  try {
    await infra.bootstrapInfra();

    // Initialize Fastify by calling bootstrapFastify
    fastify = await bootstrapFastify();

    // Start listening on the specified port and host
    await fastify.listen({
      port: env.PORT,
      host: env.HOST,
    });
  } catch (err) {
    // If Fastify instance is available, log the error using Fastify's logger
    if (fastify && fastify.log) {
      fastify.log.error(err);
    } else {
      // Fallback to console logging if Fastify isn't initialized
      console.error('Error starting server:', err);
    }

    // ensure infrastructure is shut down properly
    await infra.shutdownInfra();

    // Exit the process with a failure code
    process.exit(1);
  }
};

/**
 * Function to gracefully shut down the server
 * @param {string} signal - The signal received (e.g., SIGINT, SIGTERM)
 */
const shutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  let shutdownFailed = false;

  try {
    if (fastify) {
      try {
        // Close the Fastify server
        await fastify.close();

        console.log('Fastify server closed.');
      } catch (err) {
        console.error('Error during app shutdown:', err);
        shutdownFailed = true;
      }
    }

    // Shutdown infrastructure components
    await infra.shutdownInfra();
  } catch (err) {
    console.error('Error during infrastructure shutdown:', err);
    shutdownFailed = true;
  } finally {
    if (shutdownFailed) {
      process.exit(1); // Exit with failure code if any shutdown step failed
    } else {
      console.log('Shutdown complete. Exiting process.');
      process.exit(0); // Exit with success code
    }
  }
};

// Listen for termination signals to initiate graceful shutdown
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // It's recommended to shut down the server in case of unhandled rejections
  shutdown('unhandledRejection');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // It's recommended to shut down the server in case of uncaught exceptions
  shutdown('uncaughtException');
});

// Start the server
startServer();
