import type { Handler, Middleware } from "@/types.ts";

/**
 * A strategy for merging the default headers with the existing headers.
 */
export type Strategy = "set" | "append";

/**
 * Options for the default headers middleware.
 *
 * @property {Strategy} [strategy="append"] - The strategy to use when merging the headers.
 *   If "set", the default headers will overwrite any existing headers.
 *   If "append", the default headers will be appended to any existing headers.
 */
export interface DefaultHeaderOptions {
  strategy?: Strategy;
}

/**
 * Merge the default headers into the initial headers based on the given strategy.
 *
 * @param {Headers} initialHeaders - The initial headers.
 * @param {HeadersInit} defaultHeaders - The default headers to add.
 * @param {Strategy} strategy - The strategy to use when merging the headers.
 *   If "set", the default headers will overwrite any existing headers.
 *   If "append", the default headers will be appended to any existing headers.
 * @returns {Headers} The merged headers.
 */
const mergeHeaders = (
  initialHeaders: Headers,
  defaultHeaders: HeadersInit,
  strategy: Strategy,
): Headers => {
  const mergedHeaders = new Headers(initialHeaders);

  new Headers(defaultHeaders).forEach((value, key) => {
    mergedHeaders[strategy](key, value);
  });

  return mergedHeaders;
};

/**
 * A middleware that adds default headers to the given request.
 *
 * @example Usage
 * ```ts
 * import { buildFetch } from "@pretch/core";
 * import { applyMiddlewares, defaultHeadersMiddleware} from "@pretch/core/middleware";
 *
 * const customFetch = buildFetch(
 * 	applyMiddlewares(
 * 		defaultHeadersMiddleware({
 *         			"Content-Type": "application/json; charset=UTF-8"
 * 			},
 * 			{
 * 			strategy: "set", // Optional, by default the headers appended
 * 		}),
 * 	)
 * );
 * ```
 *
 * @param {HeadersInit} defaultHeaders - The default headers to add.
 * @param {DefaultHeaderOptions} options
 * @param {Strategy} [options.strategy="append"] - The strategy to use when merging the headers.
 *   If "set", the default headers will overwrite any existing headers.
 *   If "append", the default headers will be appended to any existing headers.
 * @returns {Middleware} A middleware that adds the default headers to the request.
 */
export function defaultHeadersMiddleware(
  defaultHeaders: HeadersInit,
  { strategy = "append" }: DefaultHeaderOptions = {},
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
