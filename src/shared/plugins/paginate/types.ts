import { Model, SortValues } from 'mongoose'

export interface PaginateOptions {
  limit?: number
  page?: number
  sort?: Record<string, SortValues> | null
  url?: string
  populate?: {
    path?: string | any
    select?: string | any
    model?: string | Model<any>
  }
}

export interface PaginateResponse<D> {
  from?: number
  to?: number
  elements: Array<D>
  pagination: {
    totalElements: number
    totalPages: number
    perPage: number
    currentPage: number
    lastPage: number
  }
  links: {
    firstPageUrl: string
    lastPageUrl: string
    nextPageUrl: string
    prevPageUrl: string
    path: string
  }
}

export interface PaginatePopulateOptions {
  path?: string | any
  select?: string | any
  model?: string | Model<any>
}

export interface PaginatePluginOptions {
  startAt: number
  appUrl?: string
  appUrlSanitizer?: (url: string) => string
}
