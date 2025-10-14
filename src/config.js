if (!process.env.APP_ENV_LOADED) {
  require('dotenv').config();
}

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
});

module.exports = { env };
