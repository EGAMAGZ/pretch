import pretch, { type Enhancer, type Pathname, type Methods } from "@pretch/core";
import { useSignal } from "@preact/signals";
import type { QueryMethods, QueryResult } from "@/types.ts";

/**
 * A hook that creates a set of HTTP method functions with optional enhancement
 * and tracks the status of requests.
 *
 * @description
 * This hook provides:
 * - Type-safe HTTP method functions (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
 * - Loading and error state management
 * - Request enhancement capabilities
 * - Automatic response parsing
 *
 * ## Basic Usage
 * ```ts
 * const { get, post } = useQuery<UserData>("https://api.example.com");
 * 
 * // Make a GET request
 * const { data, loading, error } = await get("/users/1");
 * 
 * // Make a POST request
 * const { data } = await post("/users", {
 *   body: JSON.stringify({ name: "John" })
 * });
 * ```
 *
 * ## Request Enhancement
 * The hook supports request enhancement through enhancer functions:
 *
 * 1. Custom enhancers:
 * ```ts
 * import type { Enhancer, Handler } from "@pretch/core";
 *
 * const loggingEnhancer: Enhancer = (handler: Handler) => {
 *   return async (request: Request) => {
 *     console.log('Request:', request.url);
 *     const response = await handler(request);
 *     console.log('Response:', response.status);
 *     return response;
 *   };
 * };
 *
 * const { get } = useQuery("https://api.example.com", loggingEnhancer);
 * ```
 *
 * 2. Built-in middlewares:
 * ```ts
 * import { applyMiddleware, authorization, retry } from "@pretch/core/middleware";
 *
 * const { post } = useQuery("https://api.example.com", 
 *   applyMiddleware(
 *     authorization("token", "bearer"),
 *     retry()
 *   )
 * );
 * ```
 *
 * @template T - The expected type of the response data
 * @param {string} baseUrl - The base URL for all requests
 * @param {Enhancer} [enhancer] - An optional function to enhance the fetch behavior
 * @returns {QueryMethods<T>} Object containing HTTP method functions:
 *  - get: Function for GET requests
 *  - post: Function for POST requests
 *  - put: Function for PUT requests
 *  - patch: Function for PATCH requests
 *  - delete: Function for DELETE requests
 *  - head: Function for HEAD requests
 *  - options: Function for OPTIONS requests
 *  Each method returns a Promise with:
 *  - data: The parsed response data (type T)
 *  - loading: Whether the request is in progress
 *  - error: Error if request failed
 */
export function useQuery<T>(baseUrl: string, enhancer?: Enhancer): QueryMethods<T> {
  const customFetch = pretch(baseUrl, enhancer);

  async function call<T>(
    url?: Pathname,
    options?: Omit<RequestInit, "method">,
    method: keyof Methods = "get",
  ): Promise<QueryResult<T>> {
    const data = useSignal<T | null>(null);
    const error = useSignal<Error | null>(null);
    const loading = useSignal(false);

    loading.value = true;
    error.value = null;

    const methodFn = customFetch[method];
    try {
      const response = await methodFn(url, options);
      data.value = (await response.json()) as T;
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }

    return {
      data: data.value,
      error: error.value,
      loading: loading.value,
    };
  }

  return {
    get: (url = "/", options) => call(url, options, "get"),
    post: (url = "/", options) => call(url, options, "post"),
    put: (url = "/", options) => call(url, options, "put"),
    patch: (url = "/", options) => call(url, options, "patch"),
    delete: (url = "/", options) => call(url, options, "delete"),
    head: (url = "/", options) => call(url, options, "head"),
    options: (url = "/", options) => call(url, options, "options"),
  };
}
