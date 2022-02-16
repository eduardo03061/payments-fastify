import { FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { Types } from 'mongoose'

export default fp<void>(async (fastify) => {
  fastify.decorateRequest('getObjectIdHeaders', function (...headers: Array<string>): Array<Types.ObjectId> {
    const objectIdHeaders = []

    for (const key of headers) {
      const header = String(this.headers[key] || '')
      if (header) {
        objectIdHeaders.push(new Types.ObjectId(header))
      }
    }

    return objectIdHeaders
  })

  fastify.decorateRequest('getHeaders', function <T>(this: FastifyRequest, ...headers: Array<string>): Array<T> {
    const headersValues: Array<T> = []

    for (const key of headers) {
      const header = String(this.headers[key] || '')
      if (header) {
        headersValues.push(header as any)
      }
    }

    return headersValues
  })
})

declare module 'fastify' {
  export interface FastifyRequest {
    getObjectIdHeaders: (...headers: Array<string>) => Array<Types.ObjectId>
    getHeaders: <T>(...headers: Array<string>) => Array<T>
  }
}
