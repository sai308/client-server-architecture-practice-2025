const { executeRefund } = require('@/useCases/shop/refundPurchase');

/**
 * @description Route to refund purchase by bill.
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {import('fastify').RouteOptions}
 */
module.exports.refundPurchase = (fastify) => ({
  url: '/shop/refund',
  method: 'POST',
  schema: {
    description: 'Refund purchase by bill',
    tags: ['shop'],
    body: {
      type: 'object',
      required: ['billId'],
      properties: {
        billId: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          refundedBill: {
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
    fastify.authGuardFactory({
      isPrivilegeRequired: true,
    }),
  ]),
  handler: async (request, reply) => {
    try {
      const { billId } =
        /**
         * @type {{ billId: string }}
         */
        (request.body);

      const opRes = await executeRefund(billId);

      return reply.code(200).send(opRes);
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
