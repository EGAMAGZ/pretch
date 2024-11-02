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
 * @example Usage
 * ```ts
 * import type { Enhancer, Handler } from "@pretch/core";
 *
 * // Custom enhancer that adds an authorization header to every request
 * function authHeaderEnhancer(handler: Handler){
 * 	return async (request: Request) => {
 * 		const modifiedRequest = new Request(request, {
 * 			headers: {
 * 				...request.headers,
 * 				'Authorization': "Bearer my-token", // Custom header
 * 			},
 * 		});
 *
 * 		// The modified request is passed to the next handler
 * 		return handler(modifiedRequest);
 * 	};
 * }
 * ```
 *
 * @param {Handler} handler - The handler to enhance.
 * @returns {Handler} The enhanced handler.
 */
export interface Enhancer {
  (handler: Handler): Handler;
}

/**
 * A middleware function to enhacne fetch behaviour.
 *
 * @example Examples of custom middleware definition
 * ```ts
 * import { Middleware, Handler } from "@pretch/core";
 *
 * async function simpleMiddleware(request: Request, next: Handler){
 * 	try {
 * 		// Logic before	request
 * 		const response = await next(request);
 * 		// Logic after request
 * 		return response;
 * 	} catch(error){
 * 		// Handle error
 * 		throw error; // Throw error or return response
 * 	}
 * }
 *
 * function curriedMiddleware(): Middleware {
 * 	return async (request: Request, next: Handler) => {
 * 		try {
 * 			// Logic before	request
 * 			const response = await next(request);
 * 			// Logic after request
 * 			return response;
 * 		} catch(error){
 * 			// Handler error
 * 			throw error; // Throw error or return response
 * 		}
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
 * A custom fetch function returned by {@link buildFetch}
 *
 * @param {string | URL} url - The URL to fetch.
 * @param {RequestInit} [options] - The options for the request.
 * @returns {Promise<Response>} A promise that resolves to the response.
 */
export type CustomFetch = (
  url: string | URL,
  options?: RequestInit,
) => Promise<Response>;
