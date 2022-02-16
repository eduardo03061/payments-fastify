import Joi, { Extension, Root, StringSchema } from 'joi'
import { Types } from 'mongoose'

interface ExtendedStringSchema extends StringSchema {
  objectId(): this
}

export interface ExtendedJoi extends Root {
  string(): ExtendedStringSchema
}

export const stringObjectExtension: Extension = {
  type: 'string',
  base: Joi.string(),
  messages: {
    'string.objectId': '{{#label}} must be a valid mongo id'
  },
  rules: {
    objectId: {
      validate: (value: any, helpers) => {
        if (!Types.ObjectId.isValid(value)) {
          return helpers.error('string.objectId')
        }

        return value
      }
    }
  }
}

export const StringObjectExtension: ExtendedJoi = Joi.extend(stringObjectExtension)
