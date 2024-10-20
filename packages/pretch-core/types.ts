/**
 * The result of a fetch request.
 *
 * @typedef {Object} FetchResult
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
 * @typedef {Function} Handler
 * @param {Request} request - The request.
 * @returns {Response} The response.
 */

export interface Handler {
  (request: Request): Response | Promise<Response>;
}

/**
 * A function that takes a request function and returns a new request function.
 *
 * @typedef {Function} Enhancer
 * @param {Handler} request - The request function.
 * @returns {Handler} The new request function.
 */

export interface Enhancer {
  (request: Handler): Handler;
}

/**
 * A middleware function.
 *
 * @typedef {Function} Middleware
 * @param {Request} request - The request.
 * @param {Handler} next - The next handler in the chain.
 * @returns {Response | Promise<Response>} The response.
 */

export interface Middleware {
  (request: Request, next: Handler): Response | Promise<Response>;
}

