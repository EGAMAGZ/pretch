import type { CustomFetch, Enhancer, Handler } from "@/types.ts";

/**
 * Creates a custom fetch function with optional enhancement. This enhancement changes the default fetch function's behaviour
 * without directly modifying the global fetch. The custom fetch function returned can be used just like the standard fetch but
 * with the behaviour defined by the configured enhancer. The custom fetch can be reused for multiple requests. Each request will
 * apply the same enhancer behavior.
 *
 * In the next example, fetch is enhaced with a middleware that will be automatically add default headers to every request
 *
 * @example Build a custom fetch with behaviour enhaced through middlewares
 * ```ts
 * import { buildFetch } from "@pretch/core";
 * import { applyMiddlewares, defaultHeaders} from "@pretch/core/middleware";
 *
 * const customFetch = buildFetch(
 *   applyMiddlewares(
 *     defaultHeaders({
 *         "Content-Type": "application/json; charset=UTF-8",
 *       },
 *      {
 *       strategy: "append",
 *     }),
 *   ),
 * );
 *
 * const postResponse = await customFetch("https://jsonplaceholder.typicode.com/todos/1",{
 *   method: "GET"
 * });
 *
 * const createdTodo = await postResponse.json();
 *
 * const putResponse = await customFetch(
 * "https://jsonplaceholder.typicode.com/todos",{
 * 	method: "PUT",
 * 	body: JSON.stringify({
 * 			title: "Updated todo",
 * 			body: "Same task",
 * 			userId: 1,
 * 		}),
 * 	},
 * );
 *
 * const todoUpdated = await putResponse.json();
 * ```
 *
 * **Note**: Pretch provides the built-in enhancer {@link applyMiddlewares}, which allows to add a list of middleware functions
 * for handling request modification or defaults, and a couple of built-in middlewares which are: {@link validateStatus},
 * {@link retry}, {@link jwt} and {@link defaultHeaders}
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
