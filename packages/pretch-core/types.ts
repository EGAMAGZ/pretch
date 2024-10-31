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

/**
 * A function that takes a request and returns a response.
 *
 * @param {Request} request - The request.
 * @returns {Response} The response.
 */
export interface Handler {
  (request: Request): Response | Promise<Response>;
}

/**
 * An enhancer function that takes a handler and returns a new handler.
 *
 * @param {Handler} handler - The handler to enhance.
 * @returns {Handler} The enhanced handler.
 */
export interface Enhancer {
  (handler: Handler): Handler;
}

/**
 * A middleware function.
 *
 * @example Examples of custom middleware definition
 * ```ts
 * import { Middleware, Handler } from "@pretch/core";
 *
 * const logErrorMiddleware: Middleware = (request: Request, next: Handler) => {
 * 	// ...
 * 	return next(request);
 * }
 *
 * function asyncMiddleware(): Middleware {
 * 	return async (request: Request, next: Handler) => {
 * 		// ...
 * 		return await next(request);
 * 	}
 * }
 * ```
 *
 * @param {Request} request - The request.
 * @param {Handler} next - The next handler in the chain.
 * @returns {Response | Promise<Response>} The response.
 */
export interface Middleware {
  (request: Request, next: Handler): Response | Promise<Response>;
}

/**
 * A custom fetch function.
 *
 * @param {string | URL} url - The URL to fetch.
 * @param {RequestInit} [options] - The options for the request.
 * @returns {Promise<Response>} A promise that resolves to the response.
 */
export type CustomFetch = (
  url: string | URL,
  options?: RequestInit,
) => Promise<Response>;
