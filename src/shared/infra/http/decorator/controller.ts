import { container, injectable, Lifecycle } from 'tsyringe'

export const Controller = (prefix = ''): ClassDecorator => {
  return (target: any): any => {
    Reflect.defineMetadata('prefix', prefix, target)

    // Since routes are set by our methods this should almost never be true (except the controller has no methods)
    if (!Reflect.hasMetadata('routes', target)) {
      Reflect.defineMetadata('routes', [], target)
    }

    // hack and register class in container
    const token = target?.name
    if (token && typeof token === 'string' && token.endsWith('Controller') && !container.isRegistered(token)) {
      injectable()(target)

      container.register(token, { useClass: target }, { lifecycle: Lifecycle.Singleton })
    }
  }
}
