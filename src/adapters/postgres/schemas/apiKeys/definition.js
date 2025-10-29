const {
  integer,
  pgTable,
  varchar,
  timestamp,
  boolean,
} = require('drizzle-orm/pg-core');

const { users } = require('@/adapters/postgres/schemas/users/definition');

const apiKeys = pgTable('apiKeys', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  key: varchar({ length: 64 }).notNull().unique(),
  ownerId: integer()
    .notNull()
    .references(() => users.id),
  isActive: boolean().notNull().default(true),
  lastUsedAt: timestamp('last_used_at').default(null),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

module.exports = { apiKeys };
