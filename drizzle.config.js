if (!process.env.APP_ENV_LOADED) {
  require('dotenv').config();
}

const { defineConfig } = require('drizzle-kit');

module.exports = defineConfig({
  out: './drizzle',
  schema: './src/adapters/postgres/schemas',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.PG_DATABASE_URL,
  },
});
