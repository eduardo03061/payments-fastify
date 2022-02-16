import 'reflect-metadata'

import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify'
import { AddressInfo } from 'net'

import app from './shared/infra/http/fastify/fastify'
import { fatalErrorHandler } from './shared/utils/error'
import { logger } from './shared/utils/logger'

process
  .on('uncaughtException', fatalErrorHandler)
  .on('unhandledRejection', (reason) => fatalErrorHandler(new Error(String(reason))))

const main = async (): Promise<void> => {
  const ajv = {
    customOptions: {
      allErrors: true,
      coerceTypes: true, // change data type of data to match type keyword
      jsonPointers: true,
      nullable: true, // support keyword "nullable" from Open API 3 specification. Refer to [ajv options](https://ajv.js.org/#options)
      removeAdditional: true, // remove additional properties
      useDefaults: true, // replace missing properties and items with the values from corresponding default keyword
      verbose: true
    },
    plugins: []
  }

  const config: FastifyServerOptions = {
    ajv,
    // http2: true, // Tech debt
    ignoreTrailingSlash: true,
    logger,
    trustProxy: true // Tech debt
  }

  const server: FastifyInstance = Fastify(config)

  try {
    await server.register(app)
    await server.listen(server.config.APP_PORT || 4030, '0.0.0.0')

    const address: AddressInfo = server.server.address() as AddressInfo
    server.log.info(`🚀 Application running on: ${address.port}`)
    if (server.config.isDebug()) {
      server.log.info(server.printRoutes())
    }
  } catch (err) {
    fatalErrorHandler(err as Error)
  }
}

main()
