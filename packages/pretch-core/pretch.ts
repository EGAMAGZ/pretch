import type { CustomFetch, Enhancer, Handler } from "@/types.ts";

type Methods = Record<
  "get" | "post" | "put" | "delete" | "patch" | "head" | "options",
  (
    url?: string | URL,
    options?: Omit<RequestInit, "method">,
  ) => Promise<Response>
>;

/**
 * Creates a custom fetch function with optional enhancement. This enhancement changes the default fetch function's behaviour
 * without directly modifying the global fetch. The custom fetch function returned can be used just like the standard fetch but
 * with the behaviour defined by the configured enhancer. The custom fetch can be reused for multiple requests. Each request will
 * apply the same enhancer behavior.
 *
 * In the next example, fetch is enhaced with a middleware that will be automatically add default headers to every request
 *
 * @example Create a fetch that will use a base url
 * ```ts
 * import pretch from "@pretch/core";
 *
 * const api = pretch("https://example.com/api/");
 *
 * const users = await api.get("/users")
 * ```
 *
 * @example Create a custom fetch with behaviour enhaced through middleware
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
 * const getResponse = await customFetch("https://jsonplaceholder.typicode.com/todos/1",{
 *   method: "GET"
 * });
 *
 * const createdTodo = await getResponse.json();
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
 * @param {string | Enhancer | [string, Enhancer]} [options] - Either a function to enhance the fetch behavior, the base url to use for requests with this Pretch, or both.
 * @returns {CustomFetch} A custom fetch function that applies the enhancer, if provided.
 */
export function pretch<T extends string | Enhancer | [string, Enhancer]>(
  options: T,
): T extends Enhancer ? CustomFetch
  : Methods {
  let innerFetch: Handler = (request) => fetch(request);
  let baseUrl: string = "";

  switch (typeof options) {
    case "string": {
      baseUrl = options;
      break;
    }
    case "function": {
      innerFetch = options(innerFetch);
      break;
    }
    case "object": {
      baseUrl = options[0];
      innerFetch = options[1](innerFetch);
      break;
    }
  }

  const call: CustomFetch = (url = "/", options) =>
    Promise.resolve(
      innerFetch(new Request(baseUrl ? new URL(url, baseUrl) : url, options)),
    );

  if (typeof options === "function") {
    return call as ReturnType<typeof pretch<T>>;
  }

  return {
    get: (url, options) => call(url, { ...options, method: "GET" }),
    post: (url, options) => call(url, { ...options, method: "POST" }),
    put: (url, options) => call(url, { ...options, method: "PUT" }),
    delete: (url, options) => call(url, { ...options, method: "DELETE" }),
    patch: (url, options) => call(url, { ...options, method: "PATCH" }),
    head: (url, options) => call(url, { ...options, method: "HEAD" }),
    options: (url, options) => call(url, { ...options, method: "OPTIONS" }),
  } as ReturnType<typeof pretch<T>>;
}
