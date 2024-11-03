export type FetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: (newUrl?: string) => void;
};

export type LazyFetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetchData: (newUrl?: string, newOptions?: RequestInit) => void;
};
