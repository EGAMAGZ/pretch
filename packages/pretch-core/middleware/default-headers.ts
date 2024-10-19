import type { Handler, Middleware } from "@/types.ts";

export type Strategy = "set" | "append";

export interface DefaultHeaderOptions {
  defaultHeaders: HeadersInit;
  strategy?: Strategy;
}

const mergeHeaders = (
  initialHeaders: Headers,
  defaultHeaders: HeadersInit,
  strategy: Strategy,
) => {
  const mergedHeaders = new Headers(initialHeaders);

  new Headers(defaultHeaders).forEach((value, key) => {
    mergedHeaders[strategy](key, value);
  });

  return mergedHeaders;
};

export function defaultHeadersMiddleware(
  { defaultHeaders, strategy = "append" }: DefaultHeaderOptions,
): Middleware {
  return (request: Request, next: Handler) => {
    const updatedHeaders = mergeHeaders(
      request.headers,
      defaultHeaders,
      strategy,
    );
    const updatedRequest = new Request(request, { headers: updatedHeaders });

    return next(updatedRequest);
  };
}
