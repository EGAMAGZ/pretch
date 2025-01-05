import type { CustomFetch, Enhancer, Handler } from "@/types.ts";

/**
 * Creates a custom fetch function with optional enhancement. This enhancement changes the default fetch function's behaviour
 * without directly modifying the global fetch. The custom fetch function returned can be used just like the standard fetch but
 * with the behaviour defined by the configured enhancer. The custom fetch can be reused for multiple requests. Each request will
 * apply the same enhancer behavior.
 *
 * In the next example, fetch is enhaced with a middleware that will be automatically add default headers to every request
 *
 * @example Build a custom fetch with behaviour enhaced through middleware
 * ```ts
 * import pretch from "@pretch/core";
 * import { applyMiddleware, defaultHeaders} from "@pretch/core/middleware";
 *
 * const customFetch = pretch(
 *   applyMiddleware(
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
 * // The following request will keep the enhanced behaviour of adding default headers
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
 * **Note**: Pretch provides the built-in enhancer {@link applyMiddleware}, which allows to add a list of middleware functions
 * for handling request modification or defaults, and a couple of built-in middleware which are: {@link validateStatus},
 * {@link retry}, {@link jwt} and {@link defaultHeaders}
 *
 * @param {Enhancer} [enhancer] - An optional function to enhance the fetch behavior.
 * @returns {CustomFetch} A custom fetch function that applies the enhancer, if provided.
 */
export function pretch(enhancer?: Enhancer): CustomFetch {
  let innerFetch: Handler = (request) => fetch(request);

  if (enhancer) {
    innerFetch = enhancer(innerFetch);
  }

  return (url: string | URL, options?: RequestInit) =>
    Promise.resolve(innerFetch(new Request(url, options)));
}
