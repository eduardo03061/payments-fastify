import { Document, Model, Schema } from 'mongoose'

export interface AutoIncrementPlugin {
  field: string
}

export default function MongooseAutoIncrement<D extends Document, M extends typeof Model>({
  field
}: AutoIncrementPlugin) {
  return function (schema: Schema<D, M>): void {
    schema.pre('save', async function (this: D) {
      if (this.isNew || this.isModified(field)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const model: Model = this.model(this.constructor.$__collection.modelName)

        // Order auto increment
        const maxOrderInModel = await model
          .find({}, { [field]: 1 })
          .sort({ [field]: -1 })
          .limit(1)

        if (maxOrderInModel.length) {
          const maxOrder = maxOrderInModel[0].get(field)
          this.set(field, this.get(field) > maxOrder ? this.get(field) : maxOrder + 1)
        }
      }
    })
  }
}
