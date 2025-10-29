const { resourcesRepository } = require('@/repositories/resources');

/**
 * @description Route to create a new resource in the system.
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {import('fastify').RouteOptions}
 */
module.exports.createResource = (fastify) => ({
  url: '/resources',
  method: 'POST',
  bodyLimit: 1024,
  schema: {
    description: 'Create a new resource',
    tags: ['resources'],
    body: {
      type: 'object',
      required: ['name', 'type'],
      additionalProperties: false,
      properties: {
        name: { type: 'string', minLength: 3, maxLength: 100 },
        type: { type: 'string', minLength: 3, maxLength: 50 },
        price: { type: 'number', minimum: 0 },
        amount: { type: 'number', minimum: 0 },
      },
    },
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          type: { type: 'string' },
          price: { type: 'number', minimum: 0 },
          amount: { type: 'number', minimum: 0 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      400: { type: 'object', properties: { error: { type: 'string' } } },
      500: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
  preValidation: fastify.auth([
    fastify.authPipeFactory(),
    fastify.authGuardFactory({
      isPrivilegeRequired: true,
    }),
  ]),
  handler: async (request, reply) => {
    try {
      const {
        name,
        type,
        amount = 0,
        price = 0,
      } = /**
       * @type {{ name: string, type: string, amount?: number, price?: number }}
       */ (request.body);

      const resource = await resourcesRepository.create({
        name,
        type,
        amount,
        price,
      });

      return reply.code(201).send(resource);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to create resource' });
    }
  },
});
