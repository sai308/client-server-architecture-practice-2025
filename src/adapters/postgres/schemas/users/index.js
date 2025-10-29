const { users } = require('@/adapters/postgres/schemas/users/definition');
const {
  userRelations,
} = require('@/adapters/postgres/schemas/users/relations');

module.exports = {
  users,
  userRelations,
};
