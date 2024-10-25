import type { Enhancer } from "@/types.ts";
import type { Handler, Middleware } from "@/types.ts";

/**
 * Applies multiple middleware functions to a handler.
 *
 * @param {...Middleware} middlewares - The middleware functions to apply.
 * @returns {Enhancer} An enhancer that applies the middleware functions to a handler.
 */
export function applyMiddleware(...middlewares: Middleware[]): Enhancer {
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
