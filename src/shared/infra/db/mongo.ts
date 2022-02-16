import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import mongoose, { ConnectOptions } from 'mongoose'

export default fp(
  async (fastify: FastifyInstance, opts) => {
    const getURI = () => {
      const { DB_USERNAME, DB_PORT, DB_HOST, DB_PASSWORD, DB_DATABASE } = fastify.config

      const isLocalHost = ['localhost', '127.0.0.1'].includes(DB_HOST)

      const USER = encodeURIComponent(DB_USERNAME)
      const PASSWORD = encodeURIComponent(DB_PASSWORD)

      const PROTOCOL = isLocalHost ? 'mongodb' : 'mongodb+srv'
      const CREDENTIALS = isLocalHost ? '' : `${USER}:${PASSWORD}@`
      const HOST = `${DB_HOST}${isLocalHost ? `:${DB_PORT}` : ''}`
      const OPTIONS = `readPreference=primary&connectTimeoutMS=10000&retryWrites=true&w=majority${
        isLocalHost ? '&ssl=false' : ''
      }`

      /**
       * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
       * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
       */
      return `${PROTOCOL}://${CREDENTIALS}${HOST}/${DB_DATABASE}?${OPTIONS}`
    }

    const closeConnection = () => {
      mongoose.connection.close(() => {
        fastify.log.info('💥 Mongoose default connection disconnected through app termination')
        process.exit(0)
      })
    }

    const logger = () => {
      if (fastify.config.isDebug()) {
        mongoose.set('debug', true)

        mongoose.connection
          .on('connecting', () => fastify.log.info('⏳ Connecting Mongoose database'))
          .on('connected', () => fastify.log.info('✅ Mongoose database connected'))
          .on('disconnecting', () => fastify.log.info('⚠ Mongoose database disconnecting'))
          .on('disconnected', () => fastify.log.info('⚠ Mongoose database disconnected'))
          .on('error', (err) => fastify.log.info(`💥 Mongoose database error 💥: ${err}`))
      }

      process.on('SIGINT', closeConnection).on('SIGTERM', closeConnection)
    }

    const connect = async () => {
      const { DB_DATABASE } = fastify.config
      const uri = getURI()

      logger()

      const options: ConnectOptions = {
        // This is great for development, but not ideal for large production deployments
        autoIndex: !fastify.config.isProduction(),
        dbName: DB_DATABASE,
        loggerLevel: 'error'
      }

      await mongoose.connect(uri, options)

      fastify.log.info('⌛ [database]: loaded ✅')
      fastify.log.info(`🚀 [database]: ${DB_DATABASE}✅`)

      return mongoose.connection.db
    }

    await connect()
  },
  {
    fastify: '3.x',
    name: 'mongo' // this is used by fastify-plugin to derive the property name
  }
)
