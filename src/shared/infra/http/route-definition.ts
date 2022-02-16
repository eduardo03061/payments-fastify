export interface RouteDefinition {
  // Path to our route
  path: string
  // HTTP Request method (get, post, ...)
  requestMethod: 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'OPTIONS'
  // Method name within our class responsible for this route
  methodName: string
}
