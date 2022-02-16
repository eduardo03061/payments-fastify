import fastifyFormbody from 'fastify-formbody'
import fastifyMultipart, { FastifyMultipartOptions } from 'fastify-multipart'
import fp from 'fastify-plugin'

export default fp<FastifyMultipartOptions>(async (fastify, opts) => {
  /**
   * addToBody: true
   * Cause WARN: the multipart callback-based api is deprecated in favour of the new promise api
   *
   * attachFieldsToBody: true
   * Cause recursively issue
   * https://github.com/fastify/fastify-multipart/issues/195
   * https://github.com/fastify/fastify-multipart/issues/225
   */
  fastify.register(fastifyMultipart, {
    addToBody: true
  })
  fastify.register(fastifyFormbody)
})
