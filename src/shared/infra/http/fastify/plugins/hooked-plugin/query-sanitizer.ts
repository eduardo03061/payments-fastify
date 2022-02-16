import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import fp from 'fastify-plugin'
import { SortValues } from 'mongoose'

export default fp<void>(async (fastify) => {
  const setLimit = (limit: string | string[] | undefined) => {
    if (!limit) return
    return parseInt(<string>limit, 10) || 25
  }

  // Avoid negatives pages numbers
  const setPage = (page: string | string[] | undefined) => {
    const pageNumber = parseInt(<string>page, 10)
    if (isNaN(pageNumber)) return

    return pageNumber >= 0 ? pageNumber : 0
  }

  const setFields = (fields: string | string[] | undefined) => {
    if (!fields) return

    return fields.includes('all')
      ? {}
      : fields
          .toString()
          .trim()
          .replace(/\s/g, '')
          .split(',')
          .reduce((fields: Record<string, number>, field: string) => {
            fields[field] = 1

            return fields
          }, {})
  }

  const setSort = (sort: string | string[] | undefined) => {
    if (!sort) {
      return { _id: -1 } as Record<string, SortValues>
    }

    const sortKey = sort
      .toString()
      .replace(/,+((asc)|(1))/gi, '+')
      .replace(/,+((desc)|(-1))/gi, '-')

    return { [sortKey.slice(0, -1)]: sortKey.slice(-1) === '+' ? 1 : -1 } as Record<string, SortValues>
  }

  fastify.addHook(
    'preHandler',
    function (
      request: FastifyRequest<{ Querystring: CustomQueryString }>,
      reply: FastifyReply,
      done: HookHandlerDoneFunction
    ) {
      const payload = request.query
      const isMongo = fastify.config.DB_CONNECTION === 'mongo'

      if (payload && isMongo) {
        const { limit, page, fields, sort } = payload

        request.query.limit = setLimit(limit as any)
        request.query.page = setPage(page as any)
        request.query.fields = setFields(fields)
        request.query.sort = setSort(sort as any)
      }
      done()
    }
  )
})

// TODO: Should match with CustomQueryString or be type of query
declare module 'fastify' {
  export interface FastifyRequest {
    limit: number
    page: number
    fields: any
    sort: any
  }
}
