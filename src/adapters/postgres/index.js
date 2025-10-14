const { env } = require('@/config');
const { drizzle } = require('drizzle-orm/node-postgres');

const db = drizzle(env.PG_DATABASE_URL);
