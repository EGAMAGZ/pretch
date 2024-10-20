import type { Handler, Middleware } from "@/types.ts";

  /**
   * Apply a list of middlewares to a request.
   *
   * The order of the middlewares is important. The middlewares are called in the
   * reverse order of the list. The first middleware in the list is the last one
   * to be called.
   *
   * @param {Middleware[]} middlewares - The list of middlewares to apply.
   * @returns {Handler} A handler that applies the middlewares to the request.
   */
export function applyMiddleware(...middlewares: Middleware[]) {
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
