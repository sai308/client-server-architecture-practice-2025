const { relations } = require('drizzle-orm');
const { sessions } = require('@/adapters/postgres/schemas/sessions/definition');
const { users } = require('@/adapters/postgres/schemas/users/definition');

module.exports.sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
    relationName: 'sessionUser',
  }),
}));
