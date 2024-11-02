import type { Handler, Middleware } from "@/types.ts";

/**
 * Options for the validate status middleware.
 *
 * @property {(status: number, request: Request, response: Response) => Error} [errorFactory] -
 *   A factory function to create an error when the status is invalid.
 * @property {boolean} [shouldCancelBody] -
 *   Whether to cancel the response body when the status is invalid before throwing error.
 */
export interface ValidateStatusOptions {
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
 * @example Usage
 * ```ts
 * import { buildFetch } from "@pretch/core";
 * import { applyMiddlewares, validateStatus} from "@pretch/core/middleware";
 *
 * const customFetch = buildFetch(
 * 	applyMiddlewares(
 * 		validateStatus(
 * 			(status) => 200 <= status && status <= 399,
 * 			{
 * 				errorFactory: (status, request, response) => new Error(`Error. Status code: ${status}`),
 * 				shouldCancelBody: true
 * 			} // Optional
 * 		),
 * 	)
 * );
 * ```
 *
 * @param {(status: number, request: Request, response: Response) => boolean} validate -
 *   A function to validate the response status.
 * @param {ValidateStatusOptions} [options] - Options for the middleware.
 * @param {(status: number, request: Request, response: Response) => Error} [options.errorFactory] -
 *   A factory function to create an error when the status is invalid. Defaults to a function that creates
 *   an error with the response status.
 * @param {boolean} [options.shouldCancelBody] -
 *   Whether to cancel the response body when the status is invalid.
 * @returns {Middleware} A middleware that validates the response status.
 */
export function validateStatus(
  validate: (
    status: number,
    request: Request,
    response: Response,
  ) => boolean,
  {
    errorFactory = (_status: number, _request: Request, response: Response) =>
      new Error(`Request failed with status ${response.status}`),
    shouldCancelBody,
  }: ValidateStatusOptions = {},
): Middleware {
  return async (request: Request, next: Handler) => {
    const response = await next(request);

    const isValidStatus = validate(response.status, request, response);

    if (!isValidStatus) {
      if (shouldCancelBody) await response.body?.cancel();

      throw errorFactory(response.status, request, response);
    }
    return response;
  };
}
