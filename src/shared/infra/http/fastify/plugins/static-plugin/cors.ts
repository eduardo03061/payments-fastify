import fastifyCors, { FastifyCorsOptions } from 'fastify-cors'
import fp from 'fastify-plugin'

const whitelist = !(process.env.APP_ENV === 'production')
  ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080']
  : ['https://web.com']

export default fp<FastifyCorsOptions>(async (fastify, opts) => {
  fastify.register(fastifyCors, {
    allowedHeaders: [
      'Accept',
      'Access-Control-Allow-Credentials',
      'Access-Control-Allow-Headers',
      'Authorization',
      'Cache-Control',
      'Content-Type'
    ],
    methods: ['DELETE', 'GET', 'POST', 'PUT'],
    credentials: true,
    origin: (origin, cb) => {
      if (whitelist.indexOf(origin || '') !== -1 || !origin) {
        // Request from whitelist will pass
        cb(null, true)
        return
      }

      // Generate an error on other origins, disabling access
      cb(new Error('Not allowed by CORS'), false)
    }
  })
})
