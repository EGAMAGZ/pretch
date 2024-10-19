import type { Handler, Middleware } from "@/types.ts";

export interface JwtMiddlewareOptions {
  token: string;
  shouldApplyToken?: (request: Request) => boolean;
}

export function jwtMiddleware(
  { token, shouldApplyToken = (_request: Request) => true }: JwtMiddlewareOptions,
): Middleware {
  return (request: Request, next: Handler) => {
    if (!shouldApplyToken(request)) return next(request);

    const headers = new Headers(request.headers);
    headers.set("Authorization", `Bearer ${token}`);

    const authenticatedRequest = new Request(request, { headers });

    return next(authenticatedRequest);
  };
}
