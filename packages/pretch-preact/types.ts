/**
 * Represents the result of a fetch operation.
 *
 * @template T The type of the data returned by the fetch.
 * @property {T | null} data - The data returned by the fetch, or null if not available.
 * @property {boolean} loading - Indicates whether the fetch operation is in progress.
 * @property {Error | null} error - The error encountered during the fetch, or null if none.
 * @property {(options?: { newUrl?: string | URL; newOptions?: RequestInit }) => Promise<void>} refetch - A function to refetch the data with optional new URL and request options.
 */
export type FetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: (
    options?: { newUrl?: string | URL; newOptions?: RequestInit },
  ) => Promise<void>;
};

/**
 * Represents the result of a lazy fetch operation, where fetching is triggered manually.
 *
 * @template T The type of the data returned by the fetch.
 * @property {T | null} data - The data returned by the fetch, or null if not available.
 * @property {boolean} loading - Indicates whether the fetch operation is in progress.
 * @property {Error | null} error - The error encountered during the fetch, or null if none.
 * @property {(options?: { newUrl?: string | URL; newOptions?: RequestInit }) => Promise<void>} fetchData - A function to fetch the data manually with optional new URL and request options.
 */
export type LazyFetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetchData: (
    options?: { newUrl?: string | URL; newOptions?: RequestInit },
  ) => Promise<void>;
};
