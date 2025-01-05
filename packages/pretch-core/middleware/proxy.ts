import type { Handler, Middleware } from "@/types.ts";

/**
 * Function that determines if a request should be proxied based on URL and Request objects
 * @param {URL} url - The URL of the request
 * @param {Request} request - The original request
 * @returns {boolean} Whether the request should be proxied
 */
export type ProxyRequestFilter = (url: URL, request: Request) => boolean;

/**
 * Configuration options for the proxy middleware
 *
 * @property {(pathname: string) => string} [pathRewrite] - Optional function to rewrite the pathname before proxying
 */
export interface ProxyOptions {
  pathRewrite?: (pathname: string) => string;
}

/**
 * Filter that determines which requests should be proxied.
 * Can be a string path prefix, array of path prefixes, or a filter function
 */
export type ProxyFilter = string | string[] | ProxyRequestFilter;

/**
 * Determines if a request matches the proxy filter criteria
 *
 * @param {ProxyFilter} filter - The filter to check against
 * @param {URL} url - The URL to check
 * @param {Request} request - The request to check
 * @returns {boolean} Whether the request matches the filter
 */
function matches(filter: ProxyFilter, url: URL, request: Request): boolean {
  if (Array.isArray(filter)) {
    return filter.some((pathname) => url.pathname.startsWith(pathname));
  }
  if (typeof filter === "string") {
    return url.pathname.startsWith(filter);
  }
  if (typeof filter === "function") {
    return filter(url, request);
  }
  throw new Error(
    `Invalid filter type: ${typeof filter}. Expected string, string[], or function (ProxyRequestFilter).`,
  );
}

/**
 * Creates a proxy middleware that forwards matching requests to a target URL
 *
 * @example Usage
 * ```ts
 * import pretch from "@pretch/core";
 * import { applyMiddleware, proxy } from "@pretch/core/middleware";
 *
 * const customFetch = pretch(
 *   applyMiddleware(
 *     proxy(
 *       "/api", // Forward all requests starting with /api
 *       "https://api.example.com",
 *       {
 *         pathRewrite: (path: string) => path.replace(/^\/api/, ""), // Remove /api prefix
 *       }
 *     )
 *   )
 * );
 * ```
 *
 * @param {string} target - The base URL to proxy requests to
 * @param {ProxyFilter} filter - Determines which requests should be proxied
 * @param {ProxyOptions} options - Configuration options for the proxy
 * @param {(pathname: string) => string} [options.pathRewrite] - Optional function to rewrite the pathname before proxying
 * @returns {Middleware} A middleware that proxies matching requests to the target URL
 */
export function proxy(
  target: string,
  filter: ProxyFilter,
  {
    pathRewrite = (pathname) => pathname,
  }: ProxyOptions = {},
): Middleware {
  function createProxiedRequest({ pathname, search }: URL, request: Request) {
    const targetURL = new URL(`.${pathRewrite(pathname)}`, target);
    targetURL.search = search;

    const headers = new Headers(request.headers);
    headers.set("Host", targetURL.hostname);

    return new Request(targetURL, {
      method: request.method,
      headers,
      body: request.body,
      redirect: "manual",
    });
  }
  return (request: Request, next: Handler) => {
    const url = new URL(request.url);
    if (!matches(filter, url, request)) {
      return next(request);
    }
    const proxiedRequest = createProxiedRequest(url, request);
    return fetch(proxiedRequest);
  };
}
