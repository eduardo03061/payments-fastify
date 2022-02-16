import { injectWithTransform } from 'tsyringe'

import { ModelToClassTransform } from './model-to-class-transform'

export function InjectModel(model: any): ParameterDecorator {
  return injectWithTransform(model, ModelToClassTransform)
}
