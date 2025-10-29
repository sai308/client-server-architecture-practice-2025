/** @type {Docs.JsonSchemaWithId} */
module.exports.userSchema = {
  $id: 'User',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string', minLength: 1 },
    age: { type: 'number', minimum: 0 },
    email: { type: 'string', format: 'email' },
    balance: { type: 'number', minimum: 0 },
    username: { type: 'string', minLength: 1 },
    isPrivileged: { type: 'boolean' },
  },
  required: [
    'id',
    'name',
    'username',
    'age',
    'email',
    'balance',
    'isPrivileged',
  ],
  additionalProperties: false,
};
