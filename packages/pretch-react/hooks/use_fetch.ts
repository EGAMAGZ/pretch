import { useSignal, useSignalEffect } from "@preact/signals-react";
import { buildFetch, type Enhancer } from "@pretch/core";
import type { FetchResult } from "@/types.ts";

/**
 * A hook that creates a custom fetch function with optional enhancement
 * and tracks the status of the request. Automatically fetches the data
 * when the component mounts.
 *
 * @param {string | URL} url - The URL to fetch.
 * @param {RequestInit} [options] - The options for the request.
 * @param {Enhancer} [enhancer] - An optional function to enhance the fetch behavior.
 * @returns {FetchResult<T>} An object with the `data`, `loading`, and `error` properties
 *   and a `refetch` method.
 */
export function useFetch<T>(
  url: string | URL,
  options?: RequestInit,
  enhancer?: Enhancer,
): FetchResult<T> {
  const data = useSignal<T | null>(null);
  const loading = useSignal(false);
  const error = useSignal<Error | null>(null);

  async function fetchData(
    currentUrl: string | URL,
    currentOptions?: RequestInit,
  ) {
    loading.value = true;
    error.value = null;

    try {
      const customFetch = buildFetch(enhancer);
      const response = await customFetch(currentUrl, currentOptions);

      data.value = (await response.json()) as T;
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  }

  useSignalEffect(() => {
    fetchData(url, options);
  });

  const refetch = (newUrl?: string, newOptions?: RequestInit) =>
    fetchData(newUrl || url, newOptions || options);

  return {
    data: data.value,
    loading: loading.value,
    error: error.value,
    refetch,
  };
}
