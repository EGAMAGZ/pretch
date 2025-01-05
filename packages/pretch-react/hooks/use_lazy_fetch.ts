import pretch, { type Enhancer } from "@pretch/core";
import { useSignal } from "@preact/signals-react";
import type { LazyFetchResult } from "@/types.ts";

/**
 * A hook that creates a custom fetch function with optional enhancement
 * and tracks the status of the request. Fetches the data manually.
 *
 * @description
 * This hooks provides:
 * - Loading and error state management
 * - Type-safe response handling
 * - Request enhancement capabilities
 * - Manually do fetching
 *
 * ## Basic Usage
 * Use the hook directly forsimple fetch requests:
 * ```ts
 * const { data, loading, error, fetchData } = useLazyFetch({url:"https://example.com"});
 * ```
 *
 * ## Request Enhancement
 * The hook supports request enhancement through enhancer functions for customizing request behavior:
 *
 * 1. Custom enhancers:
 * ```ts
 * import type {Enhancer, Handler} from "@pretch/core";
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
 * const { data, fetchData } = useLazyFetch({
 *  url: "https://example.com",
 *  enhancer: loggingEnhancer
 * });
 *
 * fetchData();
 * ```
 *
 * 2. Built-in middleware:
 * ```ts
 * import { applyMiddleware, authorization, retry } from "@pretch/core/middleware";
 *
 * const { data, fetchData } = useLazyFetch({
 *   url: "https://example.com",
 *   enhancer: applyMiddleware(
 *     authorization("token", "bearer"),
 *     retry()
 *   )
 * });
 *
 * fetchData();
 * ```
 *
 * ## Dynamic Requests
 * ```ts
 * const { fetchData } = useLazyFetch({url:"/api/data"});
 *
 * // Later ...
 * fetchData({
 *  newUrl: "/api/other-data",
 *  newOptions: {
 *    method: "PUT",
 *    body: JSON.stringify({name: "New name"})
 *  }
 * });
 * ```
 *
 * @template T The expected type of the response data
 * @param {Object} options - The configuration options.
 * @param {string | URL} [options.url] - The URL to fetch.
 * @param {RequestInit} [options.options] - The options for the request.
 * @param {Enhancer} [options.enhancer] - An optional function to enhance the fetch behavior.
 * @returns {LazyFetchResult<T>} An object containing:
 *   - data: The parsed response data (type T)
 *   - loading: Whether the request is in progress
 *   - error: Error if request failed
 *   - fetchData: Function to fetch data with optional new URL and options in format { newUrl?: string | URL, newOptions?: RequestInit }
 */
export function useLazyFetch<T>(
  { url, options, enhancer }: {
    url?: string | URL;
    options?: RequestInit;
    enhancer?: Enhancer;
  } = {},
): LazyFetchResult<T> {
  const data = useSignal<T | null>(null);
  const loading = useSignal(false);
  const error = useSignal<Error | null>(null);

  async function fetchData(
    { newOptions = options, newUrl = url }: {
      newUrl?: string | URL;
      newOptions?: RequestInit;
    } = {},
  ) {
    loading.value = true;
    error.value = null;

    if (!newUrl) {
      throw new Error("No URL provided");
    }

    try {
      const customFetch = pretch(enhancer);
      const response = await customFetch(
        newUrl,
        newOptions,
      );

      data.value = (await response.json()) as T;
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  }

  return {
    data: data.value,
    loading: loading.value,
    error: error.value,
    fetchData,
  };
}
