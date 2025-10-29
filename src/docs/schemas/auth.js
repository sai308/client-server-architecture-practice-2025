/** @type {Docs.JsonSchemaWithId} */
module.exports.apiKeyHeaderSchema = {
  $id: 'ApiKeyHeader',
  type: 'object',
  properties: {
    'x-api-key': { type: 'string', minLength: 16, description: 'API key' },
  },
  additionalProperties: true,
};
