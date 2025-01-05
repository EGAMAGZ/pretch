import { useSignal, useSignalEffect } from "@preact/signals-react";
import pretch, { type Enhancer } from "@pretch/core";
import type { FetchResult } from "@/types.ts";

/**
 * A hook that creates a custom fetch function with optional enhancement and
 * tracks the status of the request. Automatically fetches the data when the
 * component mounts.
 *
 * @description
 * This hook provides:
 * - Automatic data fetching on component mount
 * - Loading and error state management
 * - Type-safe response handling
 * - Request enhancement capabilities
 * - Manual refetch functionality
 *
 * ## Basic Usage
 * Use the hook directly for simple fetch requests:
 * ```ts
 * const { data, loading, error, refetch } = useFetch("https://example.com");
 * ```
 *
 * ## Request Enhancement
 * The hook supports request enhancement through enhancer functions for customizing request behavior:
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
 * const { data } = useFetch("https://example.com", {
 *   enhancer: loggingEnhancer
 * });
 * ```
 *
 * 2. Built-in middleware:
 * ```ts
 * import { applyMiddleware, authorization, retry } from "@pretch/core/middleware";
 *
 * const { data } = useFetch("https://example.com", {
 *   enhancer: applyMiddleware(
 *     authorization("token", "bearer"),
 *     retry()
 *   )
 * });
 * ```
 *
 * ## Dynamic Requests
 * The hook's refetch function supports updating the URL and options:
 * ```ts
 * const { refetch } = useFetch("/api/data");
 *
 * // Later:
 * refetch({ newUrl: "/api/other-data", newOptions: { method: "POST" } });
 * ```
 *
 * @template T - The expected type of the response data
 * @param {string | URL} url - The URL to fetch from
 * @param {Object} options - Configuration options
 * @param {RequestInit} [options.options] - Fetch options for the request
 * @param {Enhancer} [options.enhancer] - An optional function to enhance the fetch behavior.
 * @returns {FetchResult<T>} Object containing:
 *  - data: The parsed response data (type T)
 *  - loading: Whether the request is in progress
 *  - error: Error if request failed
 *  - refetch: Function to manually trigger a new request with optional new URL and new fetch options
 */
export function useFetch<T>(
  url: string | URL,
  { options, enhancer }: {
    options?: RequestInit;
    enhancer?: Enhancer;
  } = {},
): FetchResult<T> {
  const data = useSignal<T | null>(null);
  const loading = useSignal(false);
  const error = useSignal<Error | null>(null);

  async function fetchData(
    currentUrl: string | URL,
    { currentOptions }: {
      currentOptions?: RequestInit;
    } = {},
  ) {
    loading.value = true;
    error.value = null;

    try {
      const customFetch = enhancer ? pretch(enhancer) : fetch;
      const response = await customFetch(currentUrl, {
        ...currentOptions,
      });

      data.value = (await response.json()) as T;
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  }

  useSignalEffect(() => {
    fetchData(url, { currentOptions: options });
  });

  const refetch = async (
    { newUrl = url, newOptions = options }: {
      newUrl?: string | URL;
      newOptions?: RequestInit;
    } = {},
  ) => {
    await fetchData(newUrl, { currentOptions: newOptions });
  };

  return {
    data: data.value,
    loading: loading.value,
    error: error.value,
    refetch,
  };
}
