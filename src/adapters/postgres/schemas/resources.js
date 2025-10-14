const {
  pgTable,
  text,
  uuid,
  integer,
  decimal,
  timestamp,
} = require('drizzle-orm/pg-core');

const resources = pgTable('resources', {
  id: uuid('id').defaultRandom().primaryKey(), // UUID as primary key
  name: text('name').notNull(),
  type: text('type').notNull(),
  description: text('description'),
  amount: integer('amount').notNull().default(0),
  price: decimal('price', { precision: 10, scale: 2, mode: 'number' })
    .notNull()
    .default(0.0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

module.exports = { resources };
