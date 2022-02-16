import { getModelForClass } from '@typegoose/typegoose'
import { container } from 'tsyringe'
import { Transform } from 'tsyringe/dist/typings/types'

export class ModelToClassTransform implements Transform<any, any> {
  public transform(model: any) {
    const token = `${model.constructor.name}Model`
    if (!container.isRegistered(token)) {
      container.register(token, {
        useValue: getModelForClass(model.constructor, {})
      })
    }

    return container.resolve(token)
  }
}
