const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');

const { env } = require('@/config');

const schemasWithRelations = require('./schemas');

/**
 * @description Load all schema definitions except relations
 * @type {Adapters.Postgres.Schemas}
 */
const schemas = Object.create(null);

// Dynamically load all schema definitions
for (const [key, value] of Object.entries(schemasWithRelations)) {
  if (!key.toLowerCase().endsWith('relations')) {
    schemas[key] = value;
  }
}

const pool = new Pool({
  connectionString: env.PG_DATABASE_URL,
  // Production-optimized pool settings
  max: env.IS_PROD_ENV ? 20 : 10, // Max connections per instance (20 * 4 = 80 total)
  min: env.IS_PROD_ENV ? 5 : 2, // Keep minimum connections ready
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Wait 5s for connection
  maxUses: 7500, // Recycle connections after 7500 uses
});

const db = drizzle(pool, {
  schema: schemasWithRelations,
  casing: 'snake_case',
});

// Utility function to test the database connection
const testConnection = async () => {
  await pool.query('SELECT 1'); // Simple query to test connection
};

const closeConnection = async () => {
  await pool.end();
};

module.exports = {
  $schemas: schemas,
  closeConnection,
  testConnection,
  $db: db,
};
