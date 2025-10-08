const pino = require('pino');

const { env } = require('./config');

// Set up the logger
const logger = pino({
  level: env.IS_DEV_ENV ? 'debug' : 'info',
  transport: {
    target: '@mgcrea/pino-pretty-compact',
    options: {
      colorize: true, // Enable colorized output
      translateTime: 'HH:MM:ss', // e.g., 23:59:59
      ignore: 'pid,hostname', // Ignore pid and hostname in logs
    },
  },
});

module.exports = { logger };
