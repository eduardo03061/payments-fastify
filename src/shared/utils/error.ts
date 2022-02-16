import { logger } from './logger'

export const fatalErrorHandler = (err: Error, ...args: Array<unknown>) => {
  logger.fatal(err)
  process.exit(1)
}
