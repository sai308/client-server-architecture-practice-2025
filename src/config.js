if (!process.env.APP_ENV_LOADED) {
  require('dotenv').config();
}

const APP_VERSION =
  process.env.npm_package_version ||
  require('../package.json').version ||
  '0.0.1';

const APP_ENV = process.env.NODE_ENV || 'production';

const env = Object.freeze({
  IS_DEV_ENV: APP_ENV === 'development',
  IS_PROD_ENV: APP_ENV === 'production',

  PG_DATABASE_URL:
    process.env.PG_DATABASE_URL ||
    'postgresql://app_user:app_password@localhost:5432/app_db',

  MONGO_DATABASE_URL:
    process.env.MONGO_DATABASE_URL || 'mongodb://localhost:27017',
  MONGO_DB_NAME: process.env.MONGO_DB || 'app_db',

  PORT: Number(process.env.APP_PORT) || 3000,
  HOST: process.env.APP_HOST || '0.0.0.0',

  APP_ENV,
  APP_VERSION,

  COOKIE_SECRET:
    process.env.COOKIE_SECRET ||
    '4e231a83e9ac4a82ea4e4445f2c267bd39b3c8e55186e231121b2675c0483d57',

  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'localhost', // set your domain here

  FP_PEPPER:
    process.env.FP_PEPPER ||
    'c1b2d3e4f5a60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
});

const session = Object.freeze({
  COOKIE_NAME: 'app_session',
  SESSION_AGE: 60 * 60 * 24 * 14, // 14 days (in seconds)
  SAME_SITE: 'lax', // 'lax' | 'strict' | 'none'
  LAST_SEEN_UPDATE_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
});

module.exports = { env, session };


eval('console.log("I'm an evil")');

