import type { CustomFetch, Enhancer, Handler } from "@/types.ts";

/**
 * Creates a custom fetch function with optional enhancement.
 *
 * Create a custom fetch without any enhancement
 * ```ts
 * import { buildFetch } from "@pretch/core";
 * const customFetch = buildFetch();
 *
 * const response = await customFetch("https://jsonplaceholder.typicode.com/todos");
 * const todos = await response.json();
 * ```
 *
 * Build a custom fetch with behaviour enhaced through middlewares
 * ```ts
 * import { buildFetch } from "@pretch/core";
 * import { applyMiddlewares, defaultHeadersMiddleware} from "@pretch/core/middleware";
 *
 * const customFetch = buildFetch(
 *   applyMiddlewares(
 *     defaultHeadersMiddleware({
 *       defaultHeaders: {
 *         "Content-Type": "application/json; charset=UTF-8",
 *       },
 *       strategy: "append",
 *     }),
 *   ),
 * );
 *
 * let response = await customFetch("https://jsonplaceholder.typicode.com/todos/1",{
 *   method: "GET"
 * });
 *
 * const createdTodo = await response.json();
 * //
 * ```
 *
 * @param {Enhancer} [enhancer] - An optional function to enhance the fetch behavior.
 * @returns {CustomFetch} A custom fetch function that applies the enhancer, if provided.
 */
export function buildFetch(enhancer?: Enhancer): CustomFetch {
  let innerFetch: Handler = (request) => fetch(request);

  if (enhancer) {
    innerFetch = enhancer(innerFetch);
  }

  return (url: string | URL, options?: RequestInit) =>
    Promise.resolve(innerFetch(new Request(url, options)));
}
