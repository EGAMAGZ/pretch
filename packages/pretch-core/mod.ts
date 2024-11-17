/**
 * # @pretch/core
 * Pretch is a library lets you easily create custom fetch functions
 * with enhanced behaviour to fit your needs without directly modifying the
 * global fetch.
 *
 * ## Features
 * * Zero dependencies
 * * Compatible with all JavaScript runtimes (Node.js, Bun, Deno) and browser environments
 * * Ability to create custom built-in middlewares and enhancers
 * * Built-in middlewares and enhancers
 *
 * ## Usage
 * ```ts
 * import { buildFetch } from "@pretch/core";
 * import { applyMiddlewares, defaultHeaders} from "@pretch/core/middleware";
 *
 * const customFetch = buildFetch(
 *   applyMiddlewares(
 *     defaultHeaders({
 *         "Content-Type": "application/json; charset=UTF-8",
 *       },
 *      {
 *       strategy: "append",
 *     }),
 *   ),
 * );
 *
 * const postResponse = await customFetch("https://jsonplaceholder.typicode.com/todos/1",{
 *   method: "GET"
 * });
 *
 * const createdTodo = await postResponse.json();
 *
 * // The following request will keep the enhanced behaviour of adding default headers
 * const putResponse = await customFetch(
 * "https://jsonplaceholder.typicode.com/todos",{
 * 	method: "PUT",
 * 	body: JSON.stringify({
 * 			title: "Updated todo",
 * 			body: "Same task",
 * 			userId: 1,
 * 		}),
 * 	},
 * );
 *
 * const todoUpdated = await putResponse.json();
 * ```
 *
 * ## Built-in middlewares
 *
 * Pretch provides a built-in enhancer to apply middlewares on each request
 *
 * ### Validate Status Middleware
 * Creates a middleware that validates the response status.
 * ```ts
 * import { buildFetch } from "@pretch/core";
 * import { applyMiddlewares, validateStatus} from "@pretch/core/middleware";
 *
 * const customFetch = buildFetch(
 * 	applyMiddlewares(
 * 		validateStatus(
 * 			{
 *              validate:(status) => 200 <= status && status <= 399,
 * 				errorFactory: (status, request, response) => new Error(`Error. Status code: ${status}`),
 * 				shouldCancelBody: true
 * 			} // Optional
 * 		),
 * 	)
 * );
 * ```
 *
 * ### Retry Middleware
 * A middleware that retries a request if it fails.
 *
 * ```ts
 * import { buildFetch } from "@pretch/core";
 * import { applyMiddlewares, retry} from "@pretch/core/middleware";
 *
 * const customFetch = buildFetch(
 * 	applyMiddlewares(
 * 		retry({
 * 			maxRetries: 2,
 * 			delay: 1_500,
 * 		}),
 * 	)
 * );
 * ```
 *
 * ### Default Headers Middleware
 *
 * A middleware that adds default headers to the given request.
 *
 * ```ts
 * import { buildFetch } from "@pretch/core";
 * import { applyMiddlewares, defaultHeaders} from "@pretch/core/middleware";
 *
 * const customFetch = buildFetch(
 * 	applyMiddlewares(
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
 * ### Authorization Middleware
 * A middleware that adds the given authorization header to the request.
 * ```ts
 * import { buildFetch } from "@pretch/core";
 * import { applyMiddlewares, authorization } from "@pretch/core/middleware";
 *
 * const customFetch = buildFetch(
 * 	applyMiddlewares(
 * 		authorization(
 * 			"123456789abcdef",
 * 			"bearer",
 * 			{
 * 				shouldApplyToken: (request: Request) =>
 * 					new URL(request.url).pathname.startsWith("/api/"),
 * 			},
 * 		),
 * 	)
 * );
 * ```
 *
 * @module
 */

export * from "@/types.ts";
export { buildFetch } from "@/build_fetch.ts";
