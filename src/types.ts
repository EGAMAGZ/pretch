export type FetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: (newUrl?: string) => void;
};

export interface Handler {
  (request: Request): Response | Promise<Response>;
}

export interface Enhancer {
  (request: Handler): Handler;
}

export interface Middleware {
  (request: Request, next: Handler): Response | Promise<Response>;
}
