import type { Enhancer } from "@/types.ts";
import type { Handler, Middleware } from "@/types.ts";

/**
 * Applies multiple middleware functions to a handler.
 *
 * @example Usage of `applyMiddlewares` to enhance the fetch built
 * ```ts
 * import { buildFetch, Middleware, Handler } from "@pretch/core"
 * import { applyMiddlewares, retryMiddleware } from "@pretch/core/middleware"
 *
 * const customMiddleware: Middleware = (request: Request, next: Handler) => next(request);
 *
 * const customFetch = buildFetch(
 *   applyMiddlewares(
 *     retryMiddleware(),
 *     customMiddleware
 * 	// Built-in or custom middlewares
 *   ),
 * );
 * ```
 *
 * @param {...Middleware} middlewares - The middleware functions to apply.
 * @returns {Enhancer} An enhancer that applies the middleware functions to a handler.
 */
export function applyMiddlewares(...middlewares: Middleware[]): Enhancer {
  if (middlewares.length === 0) {
    return (next: Handler) => next;
  }

  return (next: Handler) => {
    let handler = next;

    for (const middleware of middlewares.reverse()) {
      const prevHandler = handler;

      handler = (request: Request) =>
        Promise.resolve(middleware(request, prevHandler));
    }

    return handler;
  };
}
