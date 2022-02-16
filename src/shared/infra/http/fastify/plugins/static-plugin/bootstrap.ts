import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { FastifyRouteSchemaDef } from 'fastify/types/schema'
import fp from 'fastify-plugin'
import { opendirSync } from 'fs'
import Joi from 'joi'
import { join, resolve } from 'path'
import qs from 'qs'
import { container } from 'tsyringe'

import { RouteDefinition } from '../../../route-definition'

type Constructable<T> = { new (): T } | { new (...args: any): T }

async function* readModulesRecursively(
  path: string,
  filter: RegExp
): AsyncIterable<Record<string, Constructable<unknown>>> {
  const dir = opendirSync(path)

  try {
    while (true) {
      const dirent = await dir.read()
      if (dirent === null) return

      const fullFilePath = join(path, dirent.name)

      if (dirent.isDirectory()) {
        yield* readModulesRecursively(fullFilePath, filter)
      } else if (filter.test(dirent.name)) {
        yield import(fullFilePath.toString()).then((m) => {
          return m
        })
      }
    }
  } finally {
    await dir.close()
  }
}

export default fp(async (fastify: FastifyInstance, opts) => {
  const { URL } = fastify.config
  const controllers: Array<any> = []
  for await (const controllerLoaded of readModulesRecursively(
    resolve(__dirname, `../../../../../../app/`),
    /\.controller\.(ts|js)$/
  )) {
    const keys = Object.keys(controllerLoaded)
    for (const key of keys) {
      controllers.push(controllerLoaded[key])
    }
  }

  const validatorCompiler = ({ schema, method, url, httpPart }: FastifyRouteSchemaDef<Joi.AnySchema>) => {
    return (data: any) => {
      if (Joi.isSchema(schema)) {
        return schema.validate(data, {
          cache: true,
          abortEarly: false,
          debug: !fastify.config.isProduction(),
          stripUnknown: true
        })
      }
      // Tech debt: If not schema should be a throw
      return true
    }
  }

  for (const controller of controllers) {
    // This is our instantiated class
    const controllerInstance: any = container.isRegistered(controller.name)
      ? container.resolve(controller.name)
      : new controller()

    // The prefix saved to our controller
    const prefix: string = Reflect.getMetadata('prefix', controller)
    // Our `routes` array containing all our routes for this controller
    const routes: Array<RouteDefinition> = Reflect.getMetadata('routes', controller)
    const tags: Record<string, Array<string>> = Reflect.getMetadata('tags', controller)
    const schemas: Record<string, Record<string, any>> = Reflect.getMetadata('schemas', controller) || {}

    // Iterate over all routes and register them to our express application
    routes.forEach((route) => {
      // It would be a good idea at this point to substitute the `app[route.requestMethod]` with a `switch/case` statement
      // since we can't be sure about the availability of methods on our `app` object. But for the sake of simplicity
      // this should be enough for now.
      fastify.route({
        method: route.requestMethod,
        schema: {
          ...schemas[route.methodName],
          tags: [
            ...(tags && tags['default'] ? tags['default'] : []),
            ...(tags && tags[route.methodName] ? tags[route.methodName] : [])
          ]
        },
        preValidation: (
          req: FastifyRequest<{ Body: Record<string, any>; Querystring: Record<string, any> }>,
          reply: FastifyReply,
          done
        ) => {
          if (!req.body && !req.query) return done()

          // Try to sanitize body with files in payload when has an axios call or HTTP call from Gateway
          // From gateway call it would not happen, will receive a url aws bucket string
          const keys = Object.keys(req.body || {})
          const files: Record<string, unknown> = {}

          for (const key of keys) {
            const field = req.body[key]
            const fieldContainFile =
              Array.isArray(field) && field.length && field[0].data && field[0].data.type === 'Buffer'

            if (!fieldContainFile) continue

            // Delete all files from req.body
            files[key] = field
            delete req.body[key]
          }

          // Set files to req global object
          if (Object.keys(files).length) {
            Object.assign(req, { files })
          }

          // Parse data from gateway | helps with arrays data type problems
          req.body = qs.parse(req.body)
          req.query = qs.parse(req.query)
          done()
        },
        validatorCompiler,
        url: `${URL.startsWith('/') ? URL : `/${URL}`}${prefix.startsWith('/') ? prefix : `/${prefix}`}${
          route.path.startsWith('/') ? route.path : `/${route.path}`
        }`,
        handler: (req: FastifyRequest, res: FastifyReply) => {
          return controllerInstance[route.methodName](req, res)
        }
      })
    })
  }
})
