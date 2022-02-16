import fp from 'fastify-plugin'
import fastifyRateLimit, { FastifyRateLimitOptions } from 'fastify-rate-limit'

import { TEN_MINUTES_IN_MILLISECONDS } from '@/shared/utils/time'

export default fp<FastifyRateLimitOptions>(async (fastify, opts) => {
  fastify.register(fastifyRateLimit, {
    timeWindow: TEN_MINUTES_IN_MILLISECONDS, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  })
})
