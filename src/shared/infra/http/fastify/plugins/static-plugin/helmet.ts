import fastifyHelmet from 'fastify-helmet'
import fp from 'fastify-plugin'

export default fp<any>(async (fastify, opts) => {
  fastify.register(fastifyHelmet, {
    // put your options here
  })
})
