import type { Handler, Middleware } from "@/types.ts";

export interface JwtMiddlewareOptions {
  token: string;
  shouldApplyToken?: (request: Request) => boolean;
}

/**
 * A middleware that adds a JWT token to a request.
 *
 * @param {JwtMiddlewareOptions} options
 * @param {string} options.token - The JWT token to add to the request.
 * @param {(request: Request) => boolean} [options.shouldApplyToken] -
 *   A function that determines whether to add the token to the request.
 *   Defaults to a function that always returns true.
 * @returns {Middleware} A middleware that adds the token to the request.
 */
export function jwtMiddleware(
  { token, shouldApplyToken = (_request: Request) => true }:
    JwtMiddlewareOptions,
): Middleware {
  return (request: Request, next: Handler) => {
    if (!shouldApplyToken(request)) return next(request);

    const headers = new Headers(request.headers);
    headers.set("Authorization", `Bearer ${token}`);

    const authenticatedRequest = new Request(request, { headers });

    return next(authenticatedRequest);
  };
}
