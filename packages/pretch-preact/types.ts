import type { Methods, Pathname } from "@pretch/core";

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

/**
 * Represents the result of a query operation.
 *
 * @template T The type of the data returned by the query.
 * @property {T | null} data - The data returned by the query, or null if not available.
 * @property {Error | null} error - The error encountered during the query, or null if none.
 * @property {boolean} loading - Indicates whether the query operation is in progress.
 */
export type QueryResult<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
};

/**
 * Represents a collection of HTTP method-specific query functions.
 *
 * @template T The default type for the response data across all methods. Defaults to unknown.
 * @property {Function} [method] For each HTTP method (GET, POST, etc.), provides a function that:
 * @param {Pathname} [url] - The URL path to send the request to
 * @param {Omit<RequestInit, "method">} [options] - Fetch options excluding the method property
 * @returns {Promise<QueryResult<R>>} A promise that resolves to a QueryResult containing the response data
 * @template R The specific return type for an individual query, defaults to T if not specified
 */
export type QueryMethods<T = unknown> = {
  [K in keyof Methods]: <R = T>(
    url?: Pathname,
    options?: Omit<RequestInit, "method">,
  ) => Promise<QueryResult<R>>;
};
