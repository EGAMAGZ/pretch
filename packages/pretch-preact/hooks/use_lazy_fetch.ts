import type { Enhancer } from "@pretch/core";
import { useSignal } from "@preact/signals";
import { buildFetch } from "../../pretch-core/build_fetch.ts";
import type { LazyFetchResult } from "@/types.ts";

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
