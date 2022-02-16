export const Validate = (schema: any): MethodDecorator => {
  return function (target: any, propertyKey: string | symbol) {
    if (!Reflect.hasMetadata('schemas', target.constructor)) {
      Reflect.defineMetadata('schemas', {}, target.constructor)
    }

    if (Object.keys(schema).length) {
      const schemas = Reflect.getMetadata('schemas', target.constructor)
      const validator = {
        [propertyKey]: schema,
        ...schemas
      }
      Reflect.defineMetadata('schemas', validator, target.constructor)
    }
  }
}
