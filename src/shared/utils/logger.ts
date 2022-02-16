import { resolve } from 'path'
import pino from 'pino'

const level = process.env.LOG_LEVEL || 'info'
const name = process.env.APP_NAME || 'Default microservice'

export const logger = pino(
  {
    name,
    level,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true, // colorizes the log
        levelFirst: true,
        translateTime: 'yyyy-dd-mm, h:MM:ss TT'
      }
    }
  },
  pino.destination(resolve(__dirname, './../../../logger.log'))
)
