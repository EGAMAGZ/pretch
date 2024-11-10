import { buildFetch, type Enhancer } from "@pretch/core";
import { useSignal } from "@preact/signals";
import type { LazyFetchResult } from "@/types.ts";

/**
 * A hook that creates a custom fetch function with optional enhancement
 * and tracks the status of the request. Fetches the data manually.
 *
 * @param {string} url - The URL to fetch.
 * @param {RequestInit} [options] - The options for the request.
 * @param {Enhancer} [enhancer] - An optional function to enhance the fetch behavior.
 * @returns {LazyFetchResult<T>} An object with the `data`, `loading`, and `error` properties
 *   and a `fetchData` method.
 */
export function useLazyFetch<T>(
  url: string,
  options?: RequestInit,
  enhancer?: Enhancer,
): LazyFetchResult<T> {
  const data = useSignal<T | null>(null);
  const loading = useSignal(false);
  const error = useSignal<Error | null>(null);

  async function fetchData(
    currentUrl?: string | URL,
    currentOptions?: RequestInit,
  ) {
    loading.value = true;
    error.value = null;

    try {
      const customFetch = buildFetch(enhancer);
      const response = await customFetch(
        currentUrl || url,
        currentOptions || options,
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
