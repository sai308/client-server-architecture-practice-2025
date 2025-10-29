const { apiKeys } = require('@/adapters/postgres/schemas/apiKeys/definition');

const {
  apiKeysRelations,
} = require('@/adapters/postgres/schemas/apiKeys/relations');

module.exports = {
  apiKeys,
  apiKeysRelations,
};
