/**
 * Represents the result of a fetch operation.
 *
 * @template T The type of the data returned by the fetch.
 * @property {T | null} data - The data returned by the fetch, or null if not available.
 * @property {boolean} loading - Indicates whether the fetch operation is in progress.
 * @property {Error | null} error - The error encountered during the fetch, or null if none.
 * @property {(newUrl?: string) => void} refetch - A function to refetch the data with an optional new URL.
 */
export type FetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: (newUrl?: string) => void;
};

/**
 * Represents the result of a lazy fetch operation, where fetching is triggered manually.
 *
 * @template T The type of the data returned by the fetch.
 * @property {T | null} data - The data returned by the fetch, or null if not available.
 * @property {boolean} loading - Indicates whether the fetch operation is in progress.
 * @property {Error | null} error - The error encountered during the fetch, or null if none.
 * @property {(newUrl?: string, newOptions?: RequestInit) => void} fetchData - A function to fetch the data manually with optional new URL and request options.
 */
export type LazyFetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetchData: (newUrl?: string, newOptions?: RequestInit) => void;
};
