const {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  timestamp,
} = require('drizzle-orm/pg-core');

const { users } = require('@/adapters/postgres/schemas/users/definition');

const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(), // UUID as primary key
  fp: varchar('fp', { length: 32 }).unique().notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),
  ipAddress: varchar('ip_address', { length: 15 }).notNull(),
  userAgent: text('user_agent').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
});

module.exports = { sessions };
