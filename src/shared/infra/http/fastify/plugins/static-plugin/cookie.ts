import fastifyCookie from 'fastify-cookie' // { FastifyCookieOptions }
import fp from 'fastify-plugin'
import fastifySession from 'fastify-session'

export default fp<any>(async (fastify, opts) => {
  fastify.register(fastifyCookie)

  /**
   * Know issue with 'fastify-session' plugin:
   * [FSTDEP006] FastifyDeprecation: You are decorating Request/Reply with a reference type. This reference is shared amongst all requests. Use onRequest hook instead. Property: sessionStore
   * (Use `node --trace-warnings ...` to show where the warning was created)
   */
  fastify.register(fastifySession, {
    secret: String(fastify.config.APP_KEY),
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: fastify.config.isProduction()
    }
  })
})
