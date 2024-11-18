import type { Handler, Middleware } from "@/types.ts";

/**
 * Options for the retry middleware.
 *
 * @property {number} [maxRetries=3] - The maximum number of times to retry.
 * @property {number} [delay=100] - The delay in milliseconds between retries.
 * @property {boolean} [whenNotOk=true] - Whether to retry when response is not ok (status >= 400).
 * @property {boolean} [whenCatch=true] - Whether to retry when request throws an error.
 */
export interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  whenNotOk?: boolean;
  whenCatch?: boolean;
}

/**
 * A middleware that retries a request if it fails. The middleware will retry in two scenarios:
 * 1. When the response is not ok (status >= 400) and `whenNotOk` is true
 * 2. When the request throws an error and `whenCatch` is true
 *
 * @example Usage
 * ```ts
 * import { buildFetch } from "@pretch/core";
 * import { applyMiddlewares, retry} from "@pretch/core/middleware";
 *
 * const customFetch = buildFetch(
 *   applyMiddlewares(
 *     retry({
 *       maxRetries: 2,      // Retry up to 2 times
 *       delay: 1_500,       // Wait 1.5 seconds between retries
 *     }),
 *   )
 * );
 * ```
 *
 * @param {RetryOptions} [options] - The options for the retry middleware.
 * @param {number} [options.maxRetries=3] - The maximum number of times to retry.
 * @param {number} [options.delay=100] - The delay in milliseconds between retries.
 * @param {boolean} [options.whenNotOk=true] - Whether to retry when response is not ok (status >= 400).
 * @param {boolean} [options.whenCatch=true] - Whether to retry when request throws an error.
 * @throws {Error} If delay is less than 1 or maxRetries is less than 1.
 * @returns {Middleware} A middleware that retries the request based on the specified conditions.
 */
export function retry(
  { maxRetries = 3, delay = 100, whenCatch = true, whenNotOk = true }:
    RetryOptions = {},
): Middleware {
  if (delay < 1) throw new Error("Delay must be greater than 0");

  if (maxRetries < 1) {
    throw new Error("Maximum number of retries must be greater than 0");
  }

  const wait = (milisenconds: number) =>
    new Promise((resolve) => setTimeout(resolve, milisenconds));

  return async (request: Request, next: Handler) => {
    let attempts = 0;
    while (true) {
      attempts++;
      try {
        const response = await next(request.clone());

        if (!response.ok && whenNotOk && attempts < maxRetries) {
          await response.body?.cancel();
          await wait(delay);
          continue;
        }

        return response;
      } catch (error) {
        if (whenCatch && attempts < maxRetries) {
          await wait(delay);
          continue;
        } else {
          throw error;
        }
      }
    }
  };
}
