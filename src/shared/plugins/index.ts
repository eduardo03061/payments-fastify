import { plugin } from '@typegoose/typegoose'
// https://github.com/mongodb-js/mongoose-autopopulate
import mongooseAutoPopulate from 'mongoose-autopopulate'
// https://github.com/drudge/mongoose-findorcreate#readme
import MongooseFindOrCreate from 'mongoose-findorcreate'
// https://github.com/mongoosejs/mongoose-lean-virtuals
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
// https://github.com/YuriGor/mongoose-slug-updater
import MongooseSlugUpdater from 'mongoose-slug-updater'

import { applyDecorators } from '../utils/apply-decorators'
import MongoosePaginate from './paginate/mongoose-paginate'

/**
 *
 * @returns ClassDecorator | MethodDecorator | PropertyDecorator
 */
export const useMongoosePlugin = (): any =>
  applyDecorators(
    plugin(mongooseAutoPopulate),
    plugin(MongooseFindOrCreate),
    plugin(mongooseLeanVirtuals),
    plugin(MongooseSlugUpdater),
    plugin(MongoosePaginate({ startAt: 0 }))
  )
