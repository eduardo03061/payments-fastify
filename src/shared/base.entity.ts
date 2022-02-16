import { DocumentType, modelOptions, plugin, prop, ReturnModelType, Severity } from '@typegoose/typegoose'
import { FindOrCreate } from '@typegoose/typegoose/lib/defaultClasses'
import { FilterQuery, Model } from 'mongoose'
// https://github.com/mongodb-js/mongoose-autopopulate
import mongooseAutoPopulate from 'mongoose-autopopulate'
// https://github.com/drudge/mongoose-findorcreate#readme
import MongooseFindOrCreate from 'mongoose-findorcreate'
// https://github.com/mongoosejs/mongoose-lean-virtuals
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
// https://github.com/YuriGor/mongoose-slug-updater
import MongooseSlugUpdater from 'mongoose-slug-updater'

import MongoosePaginate from './plugins/paginate/mongoose-paginate'
import { PaginateOptions, PaginatePopulateOptions, PaginateResponse } from './plugins/paginate/types'

const { APP_URL, URL } = process.env

@plugin(MongooseFindOrCreate)
abstract class FindOrCreateModel extends FindOrCreate {}

@plugin(
  MongoosePaginate({
    startAt: 0,
    appUrl: APP_URL || '/',
    appUrlSanitizer: (url: string) => {
      const pathWithoutMicroservicePrefix = url.replace(URL || '', '').replace(/\/{2,}/, '')
      return pathWithoutMicroservicePrefix
    }
  })
)
abstract class PaginateEntity extends FindOrCreateModel {
  static paginate: <D>(
    filter: FilterQuery<D>, // default {}
    projection: any | null, // default null
    options: PaginateOptions,
    populate?: PaginatePopulateOptions | Array<PaginatePopulateOptions>
  ) => Promise<Array<D>> | Promise<PaginateResponse<D>>
}

// export type BaseModel = ReturnModelType<Model<BaseEntity>>

@plugin(mongooseAutoPopulate)
@plugin(mongooseLeanVirtuals)
@plugin(MongooseSlugUpdater)
@modelOptions({
  options: {
    allowMixed: Severity.ALLOW
  },
  schemaOptions: {
    optimisticConcurrency: true,
    strict: true,
    timestamps: true,
    // Mongoose API methods toJSON
    toJSON: {
      virtuals: ['id'],
      transform: (_document, returnedObject) => {
        delete returnedObject._id
        delete returnedObject.__v
      }
    },
    // Mongoose API methods toObject
    toObject: {
      virtuals: ['id'],
      transform: (_document, returnedObject) => {
        delete returnedObject._id
        delete returnedObject.__v
      }
    }
  }
})
export abstract class BaseEntity extends PaginateEntity {
  public static readonly fieldsBase: Record<string, Record<string, unknown>> = {}
  @prop()
  createdAt?: Date // provided by schemaOptions.timestamps

  @prop()
  updatedAt?: Date // provided by schemaOptions.timestamps

  id?: string // _id getter as string

  public static async cloneDocument<M extends typeof Model, D>(
    this: ReturnModelType<M>,
    filter: FilterQuery<D>, // default {}
    projection: any | null, // default null,
    append: Record<string, unknown> = {}
  ): Promise<DocumentType<D> | null> {
    const template = await this.findOne(filter, projection)

    if (!template) return null

    const model = new this({ ...template.toJSON() })

    for (const key in append) {
      model.set(key, append[key])
    }

    await model.save()

    return model
  }

  public static fields(fields?: Record<string, number>, role: 'admin' | 'user' = 'admin'): Record<string, unknown> {
    if (!fields) return this.fieldsBase[role]
    if (typeof fields === 'object' && Object.keys(fields).length === 0) {
      // assuming in the request has 'all' and query parsed the query fields as {} empty object
      return {}
    }

    return {
      ...this.fieldsBase[role],
      ...fields
    }
  }
}
