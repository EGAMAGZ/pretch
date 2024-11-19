import { useSignal, useSignalEffect } from "@preact/signals";
import { buildFetch, type Enhancer } from "@pretch/core";
import type { FetchResult } from "@/types.ts";

/**
 * A hook that creates a custom fetch function with optional enhancement
 * and tracks the status of the request. Automatically fetches the data
 * when the component mounts.
 *
 * @template T The type of the data returned by the fetch
 * @param {string | URL} url - The URL to fetch.
 * @param {Object} [options] - The options object.
 * @param {RequestInit} [options.options] - The options for the request.
 * @param {Enhancer} [options.enhancer] - An optional function to enhance the fetch behavior.
 * @returns {FetchResult<T>} An object containing:
 *   - data: The fetched data or null
 *   - loading: Whether the request is in progress
 *   - error: Any error that occurred or null
 *   - refetch: Function to refetch with optional new URL and options
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
    fetchData(url, { currentOptions: options });
  });

  const refetch = (
    { newUrl = url, newOptions = options }: {
      newUrl?: string | URL;
      newOptions?: RequestInit;
    } = {},
  ) => fetchData(newUrl, { currentOptions: newOptions });

  return {
    data: data.value,
    loading: loading.value,
    error: error.value,
    refetch,
  };
}
