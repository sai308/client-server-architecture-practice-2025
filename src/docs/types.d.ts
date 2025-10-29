declare namespace Docs {
  export type JsonSchemaWithId = import('json-schema').JSONSchema7 & {
    $id: string;
  };

  export type OpenAPISchema = import('fastify').FastifySchema & {
    $id?: string;
  };
}
