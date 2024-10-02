import { useSignal, useSignalEffect } from "@preact/signals";
import type { FetchResult } from "@/types.ts";

export default function useFetch<T>(
    url: string | URL,
    options?: RequestInit,
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
            const response = await fetch(currentUrl, currentOptions);

            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            data.value = await response.json() as T;
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
