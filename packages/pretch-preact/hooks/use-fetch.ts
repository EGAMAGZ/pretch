import { useSignal, useSignalEffect } from "@preact/signals";
import type { Enhancer, FetchResult } from "@pretch/core";
import { buildFetch } from "@/util/build-fetch.ts";

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
    } catch (error) {
      error.value = error as Error;
    } finally {
      loading.value = false;
    }
  }

  useSignalEffect(() => {
    fetchData(url, options);
  });

  function refetch(newUrl?: string, newOptions?: RequestInit) {
    fetchData(newUrl || url, newOptions || options);
  }

  return {
    data: data.value,
    loading: loading.value,
    error: error.value,
    refetch,
  };
}
