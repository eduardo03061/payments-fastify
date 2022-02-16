import fastifyEnv, { fastifyEnvOpt } from 'fastify-env'
import fp from 'fastify-plugin'
import { container } from 'tsyringe'

export default fp(async (fastify) => {
  const schema = {
    type: 'object',
    required: ['APP_PORT'],
    properties: {
      APP_DEBUG: {
        type: 'boolean',
        default: false
      },
      APP_ENV: {
        type: 'string',
        default: 'local'
      },
      APP_KEY: {
        type: 'string'
      },
      APP_NAME: {
        type: 'string'
      },
      APP_PORT: {
        type: 'number',
        default: 4010
      },
      APP_URL: {
        type: 'string',
        default: ''
      },
      URL: {
        type: 'string',
        default: ''
      },
      DB_CONNECTION: {
        type: 'string',
        default: 'mongo'
      },
      DB_DATABASE: {
        type: 'string'
      },
      DB_HOST: {
        type: 'string'
      },
      DB_PASSWORD: {
        type: 'string'
      },
      DB_PORT: {
        type: 'number',
        default: 27017
      },
      DB_USERNAME: {
        type: 'string'
      },
      OZON_API: {
        type: 'string'
      },
      OZON_CDN: {
        type: 'string'
      },
      OZON_AUTHENTICATION: {
        type: 'string'
      },
      OZON_PAYMENT: {
        type: 'string'
      },
      OZON_GATEWAY: {
        type: 'string'
      },
      OZON_USER: {
        type: 'string'
      }
    }
  }

  const options: fastifyEnvOpt = {
    confKey: 'config',
    dotenv: {
      path: `./.env`,
      debug: true
    },
    expandEnv: true, // use dotenv-expand, default: false
    schema,
    data: process.env
  }
  fastify.register(fastifyEnv, options).after(() => {
    if (fastify.config) {
      fastify.config.isProduction = (): boolean => {
        return fastify.config.APP_ENV === 'production'
      }
      fastify.config.isDebug = (): boolean => {
        return fastify.config.APP_DEBUG
      }
    }
    container.register('env', { useValue: fastify.config })
  })
})

export interface Environment {
  // this should be same as the confKey in options
  // specify your typing here
  APP_DEBUG: boolean
  APP_ENV: 'development' | 'staging' | 'production'
  APP_KEY: string
  APP_NAME: string
  APP_PORT: number
  APP_URL: string

  URL: string

  DB_CONNECTION: string
  DB_DATABASE: string
  DB_HOST: string
  DB_PASSWORD: string
  DB_PORT: number
  DB_USERNAME: string

  OZON_API: string
  OZON_CDN: string
  OZON_AUTHENTICATION: string

  OZON_CLIENT: string
  OZON_GATEWAY: string
  OZON_USER: string

  isProduction: () => boolean
  isDebug: () => boolean
}

declare module 'fastify' {
  interface FastifyInstance {
    config: Environment
  }
}
