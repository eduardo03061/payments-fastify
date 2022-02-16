import Joi from 'joi'

import { stringObjectExtension } from '@/shared/validators/joi'

const amount = Joi.number()
const date = Joi.date()
const status = Joi.boolean()
const client = Joi.string() 
const payment = Joi.extend(stringObjectExtension).string().trim()
 
// paginate
const limit = Joi.number()
const page = Joi.number()
const fields = Joi.string().trim()
const sort = Joi.string().trim()

export const indexSchema = {
  querystring: Joi.object()
    .keys({
      limit: limit.optional(),
      page: page.optional(),
      fields: Joi.alternatives().try(Joi.array().items(Joi.string()), fields).optional(),
      sort: sort.optional()
    })
    .optional()
}

export const platformSchema = {
  params: Joi.object()
    .keys({
      payment: payment.objectId().required()
    })
    .required()
}

export const showSchema = {
  params: Joi.object()
    .keys({
      payment: payment.objectId().required()
    })
    .required()
}

export const createSchema = {
  body: Joi.object()
    .keys({
      amount: amount.allow('').optional(),
      date: date.optional(),
      status: status.optional(),
      client: client.required()
    })
    .required()
}

export const updateSchema = {
  params: Joi.object()
    .keys({
      payment: payment.objectId().required()
    })
    .required(),
  body: Joi.object()
    .keys({
      amount: amount.allow('').optional(),
      date: date.optional(),
      status: status.optional(),
      client: client.optional()
    })
    .required()
}

export const deleteSchema = {
  params: Joi.object()
    .keys({
      payment: payment.objectId().required()
    })
    .required()
}
