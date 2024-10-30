import type { Handler, Middleware } from "@/types.ts";

/**
 * Options for the retry middleware.
 *
 * @property {number} [maxRetries=3] - The maximum number of times to retry.
 * @property {number} [delay=100] - The delay in milliseconds between retries.
 */
export interface RetryMiddlewareOptions {
  maxRetries?: number;
  delay?: number;
}

/**
 * A middleware that retries a request if it fails.
 *
 * @param {RetryMiddlewareOptions} [options]
 * @param {number} [options.maxRetries=3] - The maximum number of times to retry.
 * @param {number} [options.delay=100] - The delay in milliseconds between retries.
 * @returns {Middleware} A middleware that retries the request.
 */
export function retryMiddleware(
  { maxRetries = 3, delay = 100 }: RetryMiddlewareOptions,
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
        return await next(request.clone());
      } catch (error) {
        if (attempts < maxRetries) {
          await wait(delay);
          continue;
        } else {
          throw error;
        }
      }
    }
  };
}
