import type {
  CustomFetch,
  Enhancer,
  Handler,
  Methods,
  Pathname,
} from "@/types.ts";

/**
 * Joins a pathname with a base URL, handling path normalization.
 *
 * @param {Pathname} path - The path to join with the base URL. Leading slashes will be removed.
 * @param {string | URL} baseUrl - The base URL to join the path with. Can be a URL string or URL object.
 * @returns {URL} A new URL object with the combined path.
 */
function joinPathname(path: Pathname, baseUrl: string | URL): URL {
  const url = baseUrl instanceof URL ? baseUrl : new URL(baseUrl);
  const basePath = url.pathname.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  const newPathname = `${basePath}/${normalizedPath}`;
  return new URL(newPathname, baseUrl);
}

/**
 * Creates a collection of HTTP method functions for making requests. This enhancement changes the default fetch function's behaviour
 * without directly modifying the global fetch. The method functions returned can be used just like the standard fetch but
 * with the behaviour defined by the configured enhancer. The method functions can be reused for multiple requests. Each request will
 * apply the same enhancer behavior.
 *
 * In the following example, fetch is enhanced with middleware that will automatically add default headers to every request.
 *
 * @example Create a collection of method functions with behaviour enhanced through middleware and a base URL
 * ```ts
 * import pretch from "@pretch/core";
 * import { applyMiddleware, defaultHeaders } from "@pretch/core/middleware";
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
 * const putResponse = await customFetch.put("/1", {
 *   body: JSON.stringify({
 *     title: "Updated todo",
 *     body: "Same task",
 *     userId: 1,
 *   }),
 * });
 *
 * const todoUpdated = await putResponse.json();
 * ```
 *
 * **Note**: Pretch provides the built-in enhancer {@link applyMiddleware}, which allows adding a list of middleware functions
 * for handling request modification or defaults, and a couple of built-in middleware which are: {@link validateStatus},
 * {@link retry}, {@link jwt}, and {@link defaultHeaders}.
 *
 * @param {string | URL} baseUrl - The base URL to use for requests with this Pretch.
 * @param {Enhancer} enhancer - An optional enhancer to modify the fetch behavior.
 * @returns {Methods} A collection of HTTP method functions for making requests with the enhancer applied.
 */
export function pretch(baseUrl: string | URL, enhancer?: Enhancer): Methods;

/**
 * Creates a custom fetch function with optional enhancement. This function changes the default fetch behavior
 * without modifying the global fetch. The returned custom fetch works like the standard fetch but applies
 * the behavior defined by the configured enhancer. It can be reused for multiple requests, and each request will
 * apply the same enhancer behavior.
 *
 * @example Create a custom fetch with behavior enhanced through middleware to query different URLs:
 * ```ts
 * import pretch from "@pretch/core";
 * import { applyMiddleware, defaultHeaders } from "@pretch/core/middleware";
 *
 * const customFetch = pretch(
 *   applyMiddleware(
 *     defaultHeaders({
 *       "Content-Type": "application/json; charset=UTF-8",
 *     },
 *     {
 *       strategy: "append",
 *     }),
 *   ),
 * );
 *
 * const firstResponse = await customFetch("https://example.com/api/task");
 *
 * const todo = await firstResponse.json();
 *
 * const secondResponse = await customFetch("https://otherexample.com/api/auth/sign-in");
 *
 * const user = await secondResponse.json();
 * ```
 *
 * **Note**: Pretch provides the built-in enhancer {@link applyMiddleware}, which allows adding a list of middleware functions
 * for handling request modification or defaults, and a couple of built-in middleware which are: {@link validateStatus},
 * {@link retry}, {@link jwt}, and {@link defaultHeaders}.
 * 
 * @param {Enhancer} [enhancer] - An optional enhancer to modify fetch behavior.
 * @returns {CustomFetch} A custom fetch function with the enhancer applied.
 */

export function pretch(enhancer: Enhancer): CustomFetch;

export function pretch(
  optionsOrBaseUrl: string | URL | Enhancer,
  enhancer?: Enhancer,
): Methods | CustomFetch {
  let innerFetch: Handler = (request) => fetch(request);
  let baseUrl: string | URL | undefined;
  if (typeof optionsOrBaseUrl === "string" || optionsOrBaseUrl instanceof URL) {
    baseUrl = optionsOrBaseUrl;
    if (enhancer) {
      innerFetch = enhancer(innerFetch);
    }
  } else {
    innerFetch = optionsOrBaseUrl(innerFetch);
  }

  const call: CustomFetch = (url, options) =>
    Promise.resolve(
      innerFetch(
        new Request(
          baseUrl ? joinPathname(url as Pathname, baseUrl) : url,
          options,
        ),
      ),
    );
  if (typeof optionsOrBaseUrl === "function") {
    return call;
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
  };
}
