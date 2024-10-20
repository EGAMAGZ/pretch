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
  const wait = (milisenconds: number) =>
    new Promise((resolve) => setTimeout(resolve, milisenconds));

  return async (request: Request, next: Handler) => {
    let attempts = 0;
    while (true) {
      attempts++;
      try {
        return await next(request);
      } catch (error) {
        if (attempts >= maxRetries) {
          throw error;
        }
        await wait(delay);
      }
    }
  };
}

export function retry(count: number): Middleware {
  return async (request, next) => {
    let index = 0;

    while (true) {
      index++;
      try {
        return await next(request.clone());
      } catch (error) {
        if (index < count) {
          continue;
        } else {
          throw error;
        }
      }
    }
  };
}
