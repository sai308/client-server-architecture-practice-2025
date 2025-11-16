#!/usr/bin/env node

require('module-alias/register');

const { faker } = require('@faker-js/faker');
const { $db, testConnection, closeConnection } = require('@/adapters/postgres');
const { resources } = require('@/adapters/postgres/schemas/resources');

const BATCH_SIZE = 100;
const TOTAL_RECORDS = 10_000;

/**
 * Generate a single resource record with fake data
 */
function generateFakeResource() {
  return {
    name: faker.commerce.productName(),
    type: faker.helpers.arrayElement([
      'digital',
      'physical',
      'service',
      'subscription',
      'license',
    ]),
    description: faker.commerce.productDescription(),
    amount: faker.number.int({ min: 1, max: 1000 }),
    price: parseFloat(faker.commerce.price({ min: 0.99, max: 999.99 })),
  };
}

/**
 * Seed the database with fake resource records
 */
async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Test connection
    await testConnection();
    console.log('✅ Database connection successful');

    let inserted = 0;

    // Insert in batches
    for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, TOTAL_RECORDS - i);
      const batch = Array.from({ length: batchSize }, () =>
        generateFakeResource()
      );

      await $db.insert(resources).values(batch);

      inserted += batchSize;
      const progress = ((inserted / TOTAL_RECORDS) * 100).toFixed(2);
      console.log(`📊 Progress: ${inserted}/${TOTAL_RECORDS} (${progress}%)`);
    }

    console.log(
      `✨ Successfully seeded ${inserted} resource records into the database!`
    );
  } catch (error) {
    console.error('❌ Error during seed:', error);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

// Run the seed
seed()
  .then(() => {
    console.log('🌱 Database seed completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
