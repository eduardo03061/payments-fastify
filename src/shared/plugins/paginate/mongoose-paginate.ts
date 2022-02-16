import { Document, FilterQuery, Model, Schema } from 'mongoose'
import { URL } from 'url'

import { PaginateOptions, PaginatePluginOptions, PaginatePopulateOptions, PaginateResponse } from './types'

export default function MongoosePaginate<D extends Document, M extends typeof Model>({
  startAt = 0,
  appUrl = '/',
  appUrlSanitizer
}: PaginatePluginOptions) {
  return function (schema: Schema<D, M>): void {
    schema.statics.paginate = async function paginate(
      filter: FilterQuery<D> = {},
      projection: any | null = null,
      options?: PaginateOptions,
      populate?: PaginatePopulateOptions | Array<PaginatePopulateOptions>
    ): Promise<Array<D> | PaginateResponse<D>> {
      if (hasInvalidPage(options?.page)) {
        return await simpleFind<D, M>(this, filter, projection, options)
      }

      const { url, path } = getPageUrl(appUrl, options?.url, appUrlSanitizer)

      const perPage = options?.limit || 25
      const currentPage = options?.page || startAt

      const documents = this.find(filter || {}, projection)
      if (populate) {
        if (Array.isArray(populate)) {
          for (const p of populate) {
            documents.populate(p?.path, p?.select, p?.model)
          }
        } else {
          documents.populate(populate?.path, populate?.select, populate?.model)
        }
      }

      const [totalElements, elements] = await Promise.all([
        this.find(filter || {}).countDocuments(),
        documents
          .limit(perPage)
          .skip(currentPage > startAt ? perPage * (currentPage - startAt) : 0)
          .sort(options?.sort)
      ])

      const { lastPage, totalPages } = calculatePages(totalElements, perPage, startAt)

      const response: PaginateResponse<D> = {
        elements,
        pagination: {
          totalElements,
          totalPages,
          perPage,
          currentPage,
          lastPage
        },
        links: {
          path,
          ...setPageURL(url, startAt, perPage, lastPage, currentPage, perPage)
        }
      }

      return response
    }
  }
}

function hasInvalidPage(page: any): boolean {
  return page === null || page === undefined
}

async function simpleFind<D extends Document, M extends typeof Model>(
  document: M,
  filter?: FilterQuery<D> | undefined,
  projection?: any | null,
  options?: PaginateOptions
) {
  const documents = document.find(filter || {}, projection)
  if (options?.sort) {
    documents.sort(options?.sort)
  }
  if (options?.limit) {
    documents.limit(options.limit)
  }

  return documents
}

function calculatePages(totalElements: number, perPage: number, startAt: number) {
  const lastPage = Math.ceil(totalElements / perPage) - Math.abs(startAt - 1)
  const totalPages = lastPage + 1

  return {
    lastPage,
    totalPages
  }
}

function getPageUrl(appUrl: string, baseUrl = '', appUrlSanitizer?: (url: string) => string) {
  const pathWithoutMicroservicePrefix = appUrlSanitizer ? appUrlSanitizer(baseUrl) : baseUrl
  const url = new URL(`${appUrl}/${pathWithoutMicroservicePrefix}`)

  url.search = baseUrl.split('?').pop() || ''

  const path = decodeURI(url.toString())

  return {
    url,
    path
  }
}

function setPageURL(url: URL, startAt: number, perPage: number, lastPage: number, currentPage: number, limit?: number) {
  let firstPageUrl = ''
  let lastPageUrl = ''
  let nextPageUrl = ''
  let prevPageUrl = ''

  url.searchParams.set('limit', perPage.toString())

  // configure and set firstPageUrl
  url.searchParams.set('page', `${startAt}`)
  firstPageUrl = decodeURIComponent(url.toString())

  // configure and set lastPageUrl
  url.searchParams.set('page', lastPage.toString())
  lastPageUrl = decodeURIComponent(url.toString())

  // configure and set nextPageUrl
  const nextPage = currentPage + 1
  url.searchParams.set('page', nextPage <= lastPage ? nextPage.toString() : currentPage.toString())
  nextPageUrl = decodeURIComponent(url.toString())

  if (limit) {
    url.searchParams.set('limit', perPage.toString())
    const prevPage = currentPage - 1
    url.searchParams.set('page', prevPage > startAt - 1 ? prevPage.toString() : currentPage.toString())
    prevPageUrl = decodeURIComponent(url.toString())
  }

  return {
    firstPageUrl,
    lastPageUrl,
    nextPageUrl,
    prevPageUrl
  }
}
