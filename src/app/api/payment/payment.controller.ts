import HttpStatus from 'http-status'

import { ApiTags } from '@/shared/infra/http/decorator/api-tags'
import { Controller } from '@/shared/infra/http/decorator/controller'
import { Delete, Get, Post, Put } from '@/shared/infra/http/decorator/method'
import { Validate } from '@/shared/infra/http/decorator/validation'
import { InjectModel } from '@/shared/utils/inject-model'

import { createSchema, deleteSchema, indexSchema, showSchema, updateSchema } from './payment.schema'
import { Payment, PaymentModel } from './entities/payment.entity'

@ApiTags('Payments')
@Controller('/payments')
export class SliderController {
  constructor(@InjectModel(Payment) protected readonly payment:PaymentModel) {}

  @Validate(indexSchema)
  @Get('/')
  async index(req: Request, res: Response) {
    const products = await this.payment.find({
      deletedAt: { $exists: false }
    })

    res.status(HttpStatus.OK)

    return products
  }

  @Validate(showSchema)
  @Get('/:client')
  async show(req: Request, res: Response) {
    const { payment: paymentId } = req.params

    const payment = await this.payment.findOne({ id: paymentId })

    res.status(HttpStatus.OK)

    return payment
  }

  @Validate(createSchema)
  @Post('/')
  async create(req: Request, res: Response) {
    const { body } = req

    const payment = new this.payment(body)

    const { id } = await payment.save()

    res.status(HttpStatus.CREATED)

    return {
      id
    }
  }

  @Validate(updateSchema)
  @Put('/:client')
  async update(req: Request, res: Response) {
    const { client: id } = req.params

    const payment = await this.payment.findById(id)

    if (!payment) throw req.server.httpErrors.notFound()

    const { body } = req

    const updatedPayment = await this.payment.findByIdAndUpdate(payment.id, body, {
      fields: {
        id: 1,
        email: 1
      },
      new: true
    })

    res.status(HttpStatus.OK)

    return updatedPayment
  }

  @Validate(deleteSchema)
  @Delete('/:client')
  async delete(req: Request, res: Response) {
    const { payment: paymentId } = req.params

    const paymentDelete = await this.payment.findOneAndUpdate(
      {
        _id: paymentId,
        deletedAt: { $exists: false }
      },
      { deletedAt: new Date() },
      {
        fields: {
          id: 1,
          email: 1
        },
        new: true
      }
    )

    if (!paymentDelete) throw req.server.httpErrors.notFound()

    res.status(HttpStatus.OK)

    return paymentDelete
  }
}
