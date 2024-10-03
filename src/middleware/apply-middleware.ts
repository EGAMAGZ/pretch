import type { Handler, Middleware } from "@/types.ts";

export function applyMiddleware(...middlewares: Middleware[]) {
  return (handler: Handler) => {
    return middlewares.reduceRight((_, middleware) => {
      return (request) => Promise.resolve(middleware(request, handler));
    }, handler);
  };
}
