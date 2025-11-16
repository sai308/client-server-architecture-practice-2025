const { queryCurrencyRates } = require('@/useCases/shop/getCurrencyRates');

/**
 * @description Route to get currency rates.
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {import('fastify').RouteOptions}
 */
module.exports.getCurrencyRates =
  /**
   * @type {import('fastify').RouteOptions}
   */
  {
    url: '/shop/currency-rates',
    method: 'GET',
    schema: {
      description: 'Get current currency exchange rates (remote API)',
      tags: ['shop'],
      querystring: {
        type: 'object',
        properties: {
          latest: { type: 'boolean', default: false },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              currency: { type: 'string', enum: ['USD', 'EUR'] },
              base: { type: 'string', enum: ['UAH'] },
              buy: { type: 'number', nullable: true },
              sale: { type: 'number', nullable: true },
            },
          },
        },
        500: { type: 'object', properties: { error: { type: 'string' } } },
      },
    },
    handler: async (request, reply) => {
      try {
        /**
         * @type {{ latest: boolean }}
         */
        const { latest } = request.query;

        return await queryCurrencyRates(latest);
      } catch (error) {
        request.log.error(error);
        return reply
          .code(500)
          .send({ error: 'Failed to fetch currency rates' });
      }
    },
  };
