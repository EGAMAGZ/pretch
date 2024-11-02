import type { Handler, Middleware } from "@/types.ts";

/**
 * Options for the JWT middleware.
 */
export interface JwtMiddlewareOptions {
  /**
   * A function that determines whether to add the token to the request.
   * Defaults to a function that always returns true.
   */
  readonly shouldApplyToken?: (request: Request) => boolean;
}

/**
 * A middleware that adds a JWT token to a request.
 *
 * @example Usage
 * ```ts
 * import { buildFetch } from "@pretch/core";
 * import { applyMiddlewares, jwtMiddleware} from "@pretch/core/middleware";
 *
 * const customFetch = buildFetch(
 * 	applyMiddlewares(
 * 		jwtMiddleware(
 * 			"1234567890",
 * 			{
 * 				shouldApplyToken: (request: Request) =>
 *      				new URL(request.url).pathname.startsWith("/api/"),
 * 			}
 * 		),
 * 	)
 * );
 * ```
 * @param {string} token - The JWT token to add to the request.
 * @param {JwtMiddlewareOptions} options
 * @param {(request: Request) => boolean} [options.shouldApplyToken] -
 *   A function that determines whether to add the token to the request.
 *   Defaults to a function that always returns true.
 * @returns {Middleware} A middleware that adds the token to the request.
 */
export function jwtMiddleware(
  token: string,
  { shouldApplyToken = (_request: Request) => true }: JwtMiddlewareOptions = {},
): Middleware {
  return (request: Request, next: Handler) => {
    if (!shouldApplyToken(request)) return next(request);

    const headers = new Headers(request.headers);
    headers.set("Authorization", `Bearer ${token}`);

    const authenticatedRequest = new Request(request, { headers });

    return next(authenticatedRequest);
  };
}
