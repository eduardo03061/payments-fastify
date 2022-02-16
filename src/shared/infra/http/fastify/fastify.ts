import { FastifyPluginAsync } from 'fastify'
import AutoLoad, { AutoloadPluginOptions } from 'fastify-autoload'
import fp from 'fastify-plugin'
import { resolve } from 'path'

import fastifyMongo from '../../db/mongo'
import fastifyBootstrap from './plugins/static-plugin/bootstrap'
import fastifyEnv from './plugins/static-plugin/env'

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>

const app: FastifyPluginAsync<AppOptions> = fp(async (fastify, opts): Promise<void> => {
  // Static plugins
  await fastify.register(fastifyEnv)
  await fastify.register(fastifyMongo)

  // Dynamic plugins
  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  await fastify.register(AutoLoad, {
    dir: resolve(__dirname, './plugins'),
    options: {},
    ignorePattern: /(.*(test|spec).(js|ts))|(static-plugin)/,
    autoHooks: true, // apply hooks to routes in this level
    autoHooksPattern: /^[_.]?auto(_|-)?hooks(\.js|\.cjs|\.mjs|\.ts)$/i
  })

  // Static plugins - Load controllers and routes
  await fastify.register(fastifyBootstrap)

  // TODO: tech debt, use instead of await (?)
  await fastify.after()
})

export default app
export { app }
