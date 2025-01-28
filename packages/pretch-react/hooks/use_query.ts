import pretch, {
  type Enhancer,
  type Methods,
  type Pathname,
} from "@pretch/core";
import { useSignal } from "@preact/signals-react";
import type { QueryMethods, QueryResult } from "@/types.ts";

/**
 * A hook that creates a set of HTTP method functions with optional enhancement
 * and tracks the status of requests using Preact signals.
 *
 * @description
 * This hook provides:
 * - Type-safe HTTP method functions (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
 * - Signal-based loading and error state management
 * - Request enhancement capabilities
 * - Automatic JSON response parsing
 *
 * ## Basic Usage
 * ```ts
 * interface UserData {
 *   id: number;
 *   name: string;
 * }
 *
 * const { get, post } = useQuery<UserData>("https://api.example.com");
 *
 * // Make a GET request
 * const result = await get("/users/1");
 * if (result.error) {
 *   console.error(result.error);
 * } else if (result.data) {
 *   console.log(result.data.name); // TypeScript knows this is UserData
 * }
 *
 * // Make a POST request with different response type
 * interface CreateUserResponse {
 *   success: boolean;
 * }
 * const { data } = await post<CreateUserResponse>("/users", {
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
 *  Each method returns a Promise<QueryResult<T>> containing:
 *  - data: The parsed response data (type T | null)
 *  - loading: Signal-tracked boolean indicating if request is in progress
 *  - error: Signal-tracked Error object if request failed (or null)
 */
export function useQuery<T = unknown>(
  baseUrl: string,
  enhancer?: Enhancer,
): QueryMethods<T> {
  const customFetch = pretch(baseUrl, enhancer);

  async function call<CData>(
    url?: Pathname,
    options?: Omit<RequestInit, "method">,
    method: keyof Methods = "get",
  ): Promise<QueryResult<CData>> {
    const data = useSignal<CData | null>(null);
    const error = useSignal<Error | null>(null);
    const loading = useSignal(false);

    loading.value = true;
    error.value = null;

    const methodFn = customFetch[method];
    try {
      const response = await methodFn(url, options);
      data.value = (await response.json()) as CData;
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
    get: <R>(url: Pathname = "/", options?: Omit<RequestInit, "method">) =>
      call<R>(url, options, "get"),
    post: <R>(url: Pathname = "/", options?: Omit<RequestInit, "method">) =>
      call<R>(url, options, "post"),
    put: <R>(url: Pathname = "/", options?: Omit<RequestInit, "method">) =>
      call<R>(url, options, "put"),
    patch: <R>(url: Pathname = "/", options?: Omit<RequestInit, "method">) =>
      call<R>(url, options, "patch"),
    delete: <R>(url: Pathname = "/", options?: Omit<RequestInit, "method">) =>
      call<R>(url, options, "delete"),
    head: <R>(url: Pathname = "/", options?: Omit<RequestInit, "method">) =>
      call<R>(url, options, "head"),
    options: <R>(url: Pathname = "/", options?: Omit<RequestInit, "method">) =>
      call<R>(url, options, "options"),
  };
}
