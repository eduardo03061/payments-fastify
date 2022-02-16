// mongoose-slug-updater.d.ts

declare module 'mongoose-slug-updater' {
  import { Schema } from 'mongoose'

  export default function MongooseSlugUpdater(schema: Schema<any>): void
}
