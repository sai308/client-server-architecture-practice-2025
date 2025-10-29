const { purchaseResources } = require('./purchase');
const { refundPurchase } = require('./refund');
const { getPurchaseBill } = require('./bill');

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} _opts
 */
module.exports.shopRouter = async function (fastify, _opts) {
  fastify.route(purchaseResources(fastify));
  fastify.route(getPurchaseBill(fastify));
  fastify.route(refundPurchase(fastify));
};
