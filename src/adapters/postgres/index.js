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

const pool = new Pool({ connectionString: env.PG_DATABASE_URL });

const db = drizzle(pool, { schema: schemasWithRelations });

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
