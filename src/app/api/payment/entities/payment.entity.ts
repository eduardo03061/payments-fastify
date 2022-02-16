import { DocumentType, modelOptions, prop, ReturnModelType } from '@typegoose/typegoose'
import { FilterQuery } from 'mongoose'

import { BaseEntity } from '@/shared/base.entity'

export type PaymentModel = ReturnModelType<typeof Payment>
export type PaymentDocument = DocumentType<Payment>
export type PaymentFilterQuery = FilterQuery<PaymentDocument>

@modelOptions({
  schemaOptions: {
    collection: 'payments',
    // Mongoose API methods toJSON
    toJSON: {
      virtuals: ['id'],
      transform: (_document, returnedObject) => {
        delete returnedObject._id
        delete returnedObject.__v
      }
    }
  }
})
export class Payment extends BaseEntity {
  @prop({ required: true })
  public amount!: number

  @prop({ default: Date.now })
  public date!: string

  @prop({
    default: true
  })
  public status!: boolean

  @prop({
    required: true
  })
  public client!: string

  @prop({
    required: true
  })
  public product!: string

  @prop()
  public deletedAt?: Date
}
