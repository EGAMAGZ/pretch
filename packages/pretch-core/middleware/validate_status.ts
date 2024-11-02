import type { Handler, Middleware } from "@/types.ts";

/**
 * Options for the validate status middleware.
 *
 * @property {(status: number, request: Request, response: Response) => Error} [errorFactory] -
 *   A factory function to create an error when the status is invalid.
 * @property {boolean} [shouldCancelBody] -
 *   Whether to cancel the response body when the status is invalid before throwing error.
 */
export interface ValidateStatusMiddlewareOptions {
  errorFactory?: (
    status: number,
    request: Request,
    response: Response,
  ) => Error;
  shouldCancelBody?: boolean;
}

/**
 * Creates a middleware that validates the response status.
 *
 * @param {(status: number, request: Request, response: Response) => boolean} validateStatus -
 *   A function to validate the response status.
 * @param {ValidateStatusMiddlewareOptions} [options] - Options for the middleware.
 * @param {(status: number, request: Request, response: Response) => Error} [options.errorFactory] -
 *   A factory function to create an error when the status is invalid. Defaults to a function that creates
 *   an error with the response status.
 * @param {boolean} [options.shouldCancelBody] -
 *   Whether to cancel the response body when the status is invalid.
 * @returns {Middleware} A middleware that validates the response status.
 */
export function validateStatusMiddleware(
  validateStatus: (
    status: number,
    request: Request,
    response: Response,
  ) => boolean,
  {
    errorFactory = (_status: number, _request: Request, response: Response) =>
      new Error(`Request failed with status ${response.status}`),
    shouldCancelBody,
  }: ValidateStatusMiddlewareOptions = {},
): Middleware {
  return async (request: Request, next: Handler) => {
    const response = await next(request);

    const isValidStatus = validateStatus(response.status, request, response);

    if (!isValidStatus) {
      if (shouldCancelBody) await response.body?.cancel();

      throw errorFactory(response.status, request, response);
    }
    return response;
  };
}
