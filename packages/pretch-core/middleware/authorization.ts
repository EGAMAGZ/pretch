import type { Handler, Middleware } from "@/types.ts";

/**
 * Represents the supported authorization schemes.
 *
 * @property {"basic"} basic - Basic authentication scheme.
 * @property {"bearer"} bearer - Bearer token authentication scheme.
 * @property {"digest"} digest - Digest authentication scheme.
 * @property {"oauth"} oauth - OAuth authentication scheme.
 * @property {"apikey"} apikey - API key authentication scheme.
 * @property {"jwt"} jwt - JSON Web Token authentication scheme.
 */
export type AuthorizationScheme =
  | "basic"
  | "bearer"
  | "digest"
  | "oauth"
  | "apikey"
  | "jwt";

/**
 * Options for the authorization middleware.
 *
 * @property {(request: Request) => boolean} [shouldApplyToken] - A function that determines whether to add the authorization header to the given request.
 *   If not provided, the default behavior is to add the authorization header to all requests.
 */
export interface AuthorizationOptions {
  shouldApplyToken?: (request: Request) => boolean;
}

/**
 * Adds the authorization header to the given request with the given credentials and scheme.
 * @param {Request} request - The request to add the authorization header to.
 * @param {string} credentials - The credentials to add to the authorization header.
 * @param {AuthorizationScheme} authScheme - The authorization scheme to use.
 * @returns {Headers} The modified headers with the added authorization header.
 */
function addAuthorizationHeader(
  request: Request,
  credentials: string,
  authScheme: AuthorizationScheme,
): Headers {
  const headers = new Headers(request.headers);
  switch (authScheme) {
    case "basic":
      headers.set("Authorization", `Basic ${credentials}`);
      break;

    case "jwt":
    case "oauth":
    case "bearer":
      headers.set("Authorization", `Bearer ${credentials}`);
      break;
    case "digest":
      headers.set("Authorization", `Digest ${credentials}`);
      break;
    case "apikey":
      headers.set("Authorization", `Apikey ${credentials}`);
      break;

    default:
      headers.set("Authorization", `Bearer ${credentials}`);
      break;
  }

  return headers;
}

/**
 * A middleware that adds the given authorization header to the request.
 *
 * @example Usage
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
 * @param {string} credentials - The credentials to add to the authorization header.
 * @param {AuthorizationScheme} authScheme - The authorization scheme to use.
 * @param {AuthorizationOptions} options
 * @param {(request: Request) => boolean} [options.shouldApplyToken] - A function that determines whether to add the authorization header to the given request.
 *   If not provided, the default behavior is to add the authorization header to all requests.
 * @returns {Middleware} A middleware that adds the authorization header to the request.
 */
export function authorization(
  credentials: string,
  authScheme: AuthorizationScheme,
  { shouldApplyToken = (_request: Request) => true }: AuthorizationOptions = {},
): Middleware {
  return (request: Request, next: Handler) => {
    if (!shouldApplyToken(request)) return next(request);

    const authorizatedHeaders = addAuthorizationHeader(
      request,
      credentials,
      authScheme,
    );

    const authorizedRequest = new Request(request, {
      headers: authorizatedHeaders,
    });

    return next(authorizedRequest);
  };
}
