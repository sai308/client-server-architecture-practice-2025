const { MongoClient } = require('mongodb');
const { env } = require('@/config');

/**
 * @type {{
 * client: MongoClient|null,
 * db: import('mongodb').Db|null
 * }}
 */
const ctx = Object.assign(Object.create(null), {
  client: null,
  db: null,
});

/**
 * Utility function to test the MongoDB connection
 */
const testConnection = async () => {
  const client = new MongoClient(env.MONGO_DATABASE_URL);
  ctx.client = client;

  await client.connect();
  ctx.db = client.db(env.MONGO_DB_NAME);
};

/**
 * Utility function to close the MongoDB connection
 */
const closeConnection = async () => {
  if (ctx.client) {
    await ctx.client.close();
  }
};

/**
 * Export MongoDB schemas (collections)
 */
const $cols = {
  bills: () => ctx.db.collection('bills'),
};

module.exports = {
  $db: () => ctx.db,
  closeConnection,
  testConnection,
  $cols,
};
