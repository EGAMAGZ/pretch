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
 * @property {(request:Request => boolean)} [shouldApplyHeaders] - A function that determines whether to add the default headers to the given request.
 *   If not provided, the default behaviour is to add the default headers to all requests using the chosen strategy.
 */
export interface DefaultHeaderOptions {
  strategy?: Strategy;
  shouldApplyHeaders?: (request: Request) => boolean;
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
 * import pretch from "@pretch/core";
 * import { applyMiddleware, defaultHeaders} from "@pretch/core/middleware";
 *
 * const customFetch = pretch(
 * 	applyMiddleware(
 * 		defaultHeaders({
 *         			"Content-Type": "application/json; charset=UTF-8"
 * 			},
 * 			{
 * 			strategy: "set", // Optional, by default the headers appended
 * 		}),
 * 	)
 * );
 * ```
 *
 * @param {HeadersInit} headers - The default headers to add.
 * @param {DefaultHeaderOptions} options
 * @param {Strategy} [options.strategy="append"] - The strategy to use when merging the headers.
 *   If "set", the default headers will overwrite any existing headers.
 *   If "append", the default headers will be appended to any existing headers.
 * @param {(request: Request)=>boolean} [options.shouldApplyHeaders] - A function that determines whether to add the default headers to the given request.
 *   If not provided, the default behaviour is to add the default headers to all requests using the chosen strategy.
 * @returns {Middleware} A middleware that adds the default headers to the request.
 */
export function defaultHeaders(
  headers: HeadersInit,
  { strategy = "append", shouldApplyHeaders = (_request: Request) => true }:
    DefaultHeaderOptions = {},
): Middleware {
  return (request: Request, next: Handler) => {
    if (!shouldApplyHeaders(request)) {
      return next(request);
    }

    const updatedHeaders = mergeHeaders(
      request.headers,
      headers,
      strategy,
    );
    const updatedRequest = new Request(request, { headers: updatedHeaders });

    return next(updatedRequest);
  };
}
