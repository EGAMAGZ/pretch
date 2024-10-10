import type { Handler, Middleware } from "@/types.ts";

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
