import { buildFetch, type Enhancer } from "@pretch/core";
import { useSignal } from "@preact/signals-react";
import type { LazyFetchResult } from "@/types.ts";

/**
 * A hook that creates a custom fetch function with optional enhancement
 * and tracks the status of the request. Fetches the data manually.
 *
 * @template T The type of the data returned by the fetch
 * @param {string} url - The URL to fetch.
 * @param {Object} [params] - The configuration options.
 * @param {RequestInit} [params.options] - The options for the request.
 * @param {Enhancer} [params.enhancer] - An optional function to enhance the fetch behavior.
 * @returns {LazyFetchResult<T>} An object containing:
 *   - data: The fetched data or null
 *   - loading: Whether the request is in progress
 *   - error: Any error that occurred or null
 *   - fetchData: Function to fetch data with optional new URL and options in format { newUrl?: string | URL, newOptions?: RequestInit }
 */
export function useLazyFetch<T>(
  url: string,
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
