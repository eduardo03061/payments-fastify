# Plugins Folder

Plugins define behavior that is common to all the routes in your
application. Authentication, caching, templates, and all the other cross
cutting concerns should be handled by plugins placed in this folder.

Files in this folder are typically defined through the
[`fastify-plugin`](https://github.com/fastify/fastify-plugin) module,
making them non-encapsulated. They can define decorators and set hooks
that will then be used in the rest of your application.

Check out:

* [The hitchhiker's guide to plugins](https://www.fastify.io/docs/latest/Plugins-Guide/)
* [Fastify decorators](https://www.fastify.io/docs/latest/Decorators/).
* [Fastify lifecycle](https://www.fastify.io/docs/latest/Lifecycle/).

## Static 

Static plugins should be load manually

## Dynamic 

Dynamic plugins should be load dynamic with register plugin

## Hocked

Hooked plugins can be use in the lifecycle