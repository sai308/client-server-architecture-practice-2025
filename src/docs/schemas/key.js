/** @type {Docs.JsonSchemaWithId} */
module.exports.keySchema = {
  $id: 'Key',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    isActive: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    lastUsedAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'isActive', 'createdAt', 'updatedAt', 'lastUsedAt'],
  additionalProperties: false,
};
