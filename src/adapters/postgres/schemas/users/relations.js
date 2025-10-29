const { relations } = require('drizzle-orm');
const { sessions } = require('@/adapters/postgres/schemas/sessions/definition');
const { users } = require('@/adapters/postgres/schemas/users/definition');

module.exports.userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));
