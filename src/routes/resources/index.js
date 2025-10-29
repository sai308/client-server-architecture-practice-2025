// CREATE
const { createResource } = require('./createResource');
// READ
const { getResource } = require('./getResource');
const { getResources } = require('./getResources');
// UPDATE
const { updateResource } = require('./updateResource');
const { patchResource } = require('./patchResource');
// DELETE
const { deleteResource } = require('./deleteResource');

// Register all resource routes (CRUD)
/**
 * @param {import('fastify').FastifyInstance} fastify
 * @param {object} _opts
 */
module.exports.resourcesRouter = async function (fastify, _opts) {
  fastify.route(createResource(fastify));
  fastify.route(getResources);
  fastify.route(getResource);
  fastify.route(updateResource(fastify));
  fastify.route(patchResource(fastify));
  fastify.route(deleteResource(fastify));
};
