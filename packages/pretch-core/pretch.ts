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
 * @example Create a custom fetch with behaviour enhaced through middleware and a base URL
 * ```ts
 * import pretch from "@pretch/core";
 * import { applyMiddleware, defaultHeaders} from "@pretch/core/middleware";
 *
 * const customFetch = pretch(
 *   "https://jsonplaceholder.typicode.com/todos/",
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
 * const getResponse = await customFetch.get("/1");
 *
 * const createdTodo = await getResponse.json();
 *
 * // The following request will keep the enhanced behaviour of adding default headers
 * const putResponse = await customFetch.put({
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
 * @param {string | Enhancer} [data] - Either a function to enhance the fetch behavior, the base url to use for requests with this Pretch.
 * @param {Enhancer} [enhancer] - An optional enhancer if you have a base url.
 * @returns {CustomFetch} A custom fetch function that applies the enhancer, if provided.
 */
export function pretch<
  T extends string | Enhancer,
  E extends T extends string ? Enhancer : never,
>(
  options: T,
  enhancer?: E,
): T extends Enhancer ? CustomFetch
  : Methods {
  let innerFetch: Handler = (request) => fetch(request);
  let baseUrl: string;

  switch (typeof options) {
    case "string": {
      baseUrl = options;
      if (
        enhancer
      ) {
        innerFetch = enhancer(innerFetch);
      }
      break;
    }
    case "function": {
      innerFetch = options(innerFetch);
      break;
    }
  }

  const call: CustomFetch = (url, options) =>
    Promise.resolve(
      innerFetch(new Request(new URL(url, baseUrl), options)),
    );

  if (typeof options === "function") {
    return call as ReturnType<typeof pretch<T, E>>;
  }

  return {
    get: (url = "/", options) => call(url, { ...options, method: "GET" }),
    post: (url = "/", options) => call(url, { ...options, method: "POST" }),
    put: (url = "/", options) => call(url, { ...options, method: "PUT" }),
    delete: (url = "/", options) => call(url, { ...options, method: "DELETE" }),
    patch: (url = "/", options) => call(url, { ...options, method: "PATCH" }),
    head: (url = "/", options) => call(url, { ...options, method: "HEAD" }),
    options: (url = "/", options) =>
      call(url, { ...options, method: "OPTIONS" }),
  } as ReturnType<typeof pretch<T, E>>;
}
