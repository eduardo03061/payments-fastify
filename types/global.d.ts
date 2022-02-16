// global.d.ts

type Request = import('fastify').FastifyRequest<{
  Params: Record<string, any>
  Querystring: Record<string, any>
  Body: Record<string, any>
}>

type Response = import('fastify').FastifyReply

declare module 'http' {
  interface IncomingHttpHeaders {
    'x-ozon-user'?: string
  }
}

type CustomQueryString = {
  limit?: number
  page?: number
  fields?: any
  sort?: Record<string, import('mongoose').SortValues> = {
    _id: -1
  }
}
