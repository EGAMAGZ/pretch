import type { Handler } from "@/types.ts";

/**
 * Options for the validate status middleware.
 *
 * @property {(status: number) => boolean} validateStatus - A function that
 *   takes a status code and returns a boolean indicating whether the status
 *   is valid. If the status is not valid, the middleware will throw an error.
 */
export interface ValidateStatusMiddlewareOptions {
  /**
   * A function that takes a status code and returns a boolean indicating
   * whether the status is valid.
   *
   * @param {number} status - The status code.
   * @returns {boolean} Whether the status is valid.
   */
  validateStatus: (status: number) => boolean;
}

/**
 * A middleware that validates the status of a response.
 *
 * @param {ValidateStatusMiddlewareOptions} options
 * @param {(status: number) => boolean} options.validateStatus - A function that
 *   takes a status code and returns a boolean indicating whether the status
 *   is valid. If the status is not valid, the middleware will throw an error.
 * @returns {Middleware} A middleware that validates the status of a response.
 */
export function validateStatusMiddleware(
  { validateStatus }: ValidateStatusMiddlewareOptions,
) {
  return async (request: Request, next: Handler) => {
    const response = await next(request);

    const isValidStatus = validateStatus(response.status);
    if (!isValidStatus) {
      await response.body?.cancel();
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response;
  };
}
