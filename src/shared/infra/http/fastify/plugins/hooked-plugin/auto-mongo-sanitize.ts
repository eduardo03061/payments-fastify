import mongoSanitize from 'express-mongo-sanitize'
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import fp from 'fastify-plugin'

export default fp<void>(async (fastify, opts) => {
  fastify.addHook('preHandler', function (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
    const payload = request.body as Record<string, unknown> | unknown[]
    const isMongo = request.server.config.DB_CONNECTION === 'mongo'
    if (payload && isMongo) {
      mongoSanitize.sanitize(payload, {})
    }
    done()
  })
})
