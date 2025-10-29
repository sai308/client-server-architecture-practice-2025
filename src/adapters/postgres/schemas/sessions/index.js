const { sessions } = require('@/adapters/postgres/schemas/sessions/definition');

const {
  sessionRelations,
} = require('@/adapters/postgres/schemas/sessions/relations');

module.exports = {
  sessions,
  sessionRelations,
};
