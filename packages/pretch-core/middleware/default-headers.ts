import type { Handler, Middleware } from "@/types.ts";

type Strategy = "set" | "append";

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

export function defaultHeaders(
  headers: HeadersInit,
  strategy: Strategy = "append",
): Middleware {
  return (request: Request, next: Handler) => {
    const updatedHeaders = mergeHeaders(request.headers, headers, strategy);
    const updatedRequest = new Request(request, { headers: updatedHeaders });

    return next(updatedRequest);
  };
}
