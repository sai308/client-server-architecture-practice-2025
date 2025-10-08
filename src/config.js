if (!process.env.APP_ENV_LOADED) {
  require('dotenv').config();
}

const APP_ENV = process.env.NODE_ENV || 'production';

const env = Object.freeze({
  IS_DEV_ENV: APP_ENV === 'development',
  IS_PROD_ENV: APP_ENV === 'production',
  PORT: Number(process.env.APP_PORT) || 3000,
  HOST: process.env.APP_HOST || '0.0.0.0',
  APP_ENV,
});

module.exports = { env };
