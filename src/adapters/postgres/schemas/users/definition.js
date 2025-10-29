const {
  integer,
  pgTable,
  varchar,
  timestamp,
  boolean,
} = require('drizzle-orm/pg-core');

const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  balance: integer().notNull().default(0),
  username: varchar({ length: 32 }).notNull().unique(),
  passwordHash: varchar({ length: 64 }).notNull(),
  isPrivileged: boolean().notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

module.exports = { users };
