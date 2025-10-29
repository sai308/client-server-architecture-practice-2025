const { relations } = require('drizzle-orm');
const { apiKeys } = require('@/adapters/postgres/schemas/apiKeys/definition');
const { users } = require('@/adapters/postgres/schemas/users/definition');

module.exports.apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.ownerId],
    references: [users.id],
    relationName: 'owner',
  }),
}));
