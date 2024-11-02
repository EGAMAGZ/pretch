/**
 * The result of a fetch request.
 *
 * @property {*} data - The data returned from the request.
 * @property {boolean} loading - Whether the request is loading.
 * @property {Error} error - The error returned from the request.
 * @property {Function} refetch - A function to refetch the request.
 */
export type FetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: (newUrl?: string) => void;
};
