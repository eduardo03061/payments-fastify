import fastifyCompress, { FastifyCompressOptions } from 'fastify-compress'
import fp from 'fastify-plugin'

export default fp<FastifyCompressOptions>(async (fastify, opts) => {
  fastify.register(fastifyCompress, { encodings: ['gzip', 'deflate'] })
})
