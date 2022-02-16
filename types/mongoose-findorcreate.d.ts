// mongoose-findorcreate.d.ts

declare module 'mongoose-findorcreate' {
  import { Schema } from 'mongoose'

  export default function MongooseFindOrCreate(schema: Schema<any>): void
}
