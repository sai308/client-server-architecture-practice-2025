const { executePurchase } = require('@/useCases/shop/purchaseResources');

/**
 * @description Route to purchase resources.
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {import('fastify').RouteOptions}
 */
module.exports.purchaseResources = (fastify) => ({
  url: '/shop/purchase',
  method: 'POST',
  schema: {
    description: 'Purchase resources',
    tags: ['shop'],
    body: {
      type: 'object',
      required: ['customerId', 'items'],
      properties: {
        customerId: { type: 'number' },
        items: {
          type: 'array',
          items: { $ref: 'OrderItem#' },
        },
      },
    },
    response: {
      201: {
        type: 'object',
        properties: {
          bill: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              customerId: { type: 'number' },
              total: { type: 'number' },
              items: {
                type: 'array',
                items: { $ref: 'BillItem#' },
              },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          user: { $ref: 'User#' },
        },
      },
      400: { type: 'object', properties: { error: { type: 'string' } } },
      500: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
  preValidation: fastify.auth([
    fastify.authPipeFactory(),
    fastify.authGuardFactory({ isPrivilegeRequired: false }),
  ]),
  handler: async (request, reply) => {
    try {
      const orderCandidate =
        /** @type { Domain.Purchase.Order} */
        (request.body);

      const opRes = await executePurchase(orderCandidate);

      return reply.code(201).send(opRes);
    } catch (error) {
      if (error.cause) {
        request.log.debug(
          error.cause,
          'Request handling was interrupted by the handled error'
        );
      }

      request.log.error(error);

      return reply
        .code('cause' in error ? 400 : 500)
        .send({ error: error.message });
    }
  },
});
