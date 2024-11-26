import { buildFetch, type Enhancer } from "@pretch/core";
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
 * const { data, loading, error, fetchData } = useLazyFetch("https://example.com");
 * ```
 * 
 * ## Request Enhancement
 * The hook supports request enhancement through enhancer functions for customizing request behavior:
 * 
 * 1. Custom enhancers:
 * ```ts
 * import type {Enhancer, Handler} from "@pretch/core";
 * 
 * function myCustomEnhancer(handler: Handler){
 *  return (request: Request) => {
 *    return handler(request);
 *  }
 * }
 * 
 * const { data, fetchData } = useLazyFetch("https://example.com",{
 *  enhancer: myCustomEnhancer
 * });
 * 
 * fetchData();
 * ```
 * 
 * 2. Built-in middleware:
 * ```ts
 * import { applyMiddlewares, authorization, retry } from "@pretch/core/middleware";
 * 
 * const { data, fetchData } = useLazyFetch("https://example.com", {
 *   enhancer: applyMiddlewares(
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
 * const { fetchData } = useLazyFetch("/api/data");
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
 * @param {string | URL} url - The URL to fetch.
 * @param {Object} options - The configuration options.
 * @param {RequestInit} [options.options] - The options for the request.
 * @param {Enhancer} [options.enhancer] - An optional function to enhance the fetch behavior.
 * @returns {LazyFetchResult<T>} An object containing:
 *   - data: The parsed response data (type T) 
 *   - loading: Whether the request is in progress
 *   - error: Error if request failed
 *   - fetchData: Function to fetch data with optional new URL and options in format { newUrl?: string | URL, newOptions?: RequestInit }
 */
export function useLazyFetch<T>(
  url: string | URL,
  { options, enhancer }: { options?: RequestInit; enhancer?: Enhancer } = {},
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

    try {
      const customFetch = buildFetch(enhancer);
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
