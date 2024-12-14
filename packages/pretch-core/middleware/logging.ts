import type { Handler, Middleware } from "@/types.ts";

/**
 * Type representing data available during request processing.
 *
 * @property {Request} request - The original request being processed.
 */
export type RequestLogData = {
  request: Request;
};

/**
 * Type representing data available after response is received.
 * Extends RequestLogData to include the response.
 *
 * @property {Request} request - The original request being processed.
 * @property {Response} response - The response received from the request.
 */
export type ResponseLogData = RequestLogData & {
  response: Response;
};

/**
 * Type representing data available when an error occurs.
 * Extends RequestLogData to include the error.
 *
 * @property {Request} request - The original request being processed.
 * @property {Error} error - The error that occurred during request processing.
 */
export type ErrorLogData = RequestLogData & {
  error: Error;
};

/**
 * Interface defining handlers for different logging events.
 * All methods are optional and can be async.
 *
 * @property {(data: RequestLogData) => Promise<void> | void} [onRequest] -
 *   Handler called before the request is processed.
 * @property {(data: ResponseLogData) => Promise<void> | void} [onResponse] -
 *   Handler called after a successful response is received.
 * @property {(data: ErrorLogData) => Promise<void> | void} [onCatch] -
 *   Handler called when an error occurs during request processing.
 */
export type LoggingHandler = {
  onRequest?: (
    data: RequestLogData,
  ) => Promise<void> | void;
  onResponse?: (
    data: ResponseLogData,
  ) => Promise<void> | void;
  onCatch?: (data: ErrorLogData) => Promise<void> | void;
};

/**
 * Factory function type for creating logging handlers.
 * Allows dynamic creation of handlers based on request data.
 *
 * @param {Readonly<RequestLogData>} data - The request data available when creating the handler.
 * @returns {LoggingHandler} A logging handler instance.
 */
export type LoggingHandlerFactory = (data: RequestLogData) => LoggingHandler;

/**
 * Creates a middleware that provides logging capabilities at different stages of request processing. It can be used with static handler or factory function.
 *
 * Usage with static handler
 * ```ts
 * import { buildFetch } from "@pretch/core";
 * import { applyMiddlewares, logging, type RequestLogData, type ResponseLogData,type ErrorLogData } from "@pretch/core/middleware";
 *
 * const customFetch = buildFetch(
 *   applyMiddlewares(
 *     logging({
 *       onRequest: async ({ request }: RequestLogData) => {
 *         console.log(`Starting request to ${request.url}`);
 *       },
 *       onResponse: async ({ response }: ResponseLogData) => {
 *         console.log(`Received response with status ${response.status}`);
 *       },
 *       onCatch: async ({ error }: ErrorLogData) => {
 *         console.error(`Request failed:`, error);
 *       }
 *     })
 *   )
 * );
 * ```
 *
 * Usage with factory function
 * ```ts
 * import { buildFetch } from "@pretch/core";
 * import { applyMiddlewares, logging, type RequestLogData, type ResponseLogData,type ErrorLogData } from "@pretch/core/middleware";
 *
 * const customFetch = buildFetch(
 *   applyMiddlewares(
 *     logging(
 *       (data: Readonly<RequestLogData>) => ({
 *         onRequest: async ({ request }: RequestLogData) => {
 *           console.log(`Starting request to ${request.url}`);
 *         },
 *         onResponse: async ({ response }: ResponseLogData) => {
 *           console.log(`Received response with status ${response.status}`);
 *         },
 *         onCatch: async ({ error }: ErrorLogData) => {
 *           console.error(`Request failed:`, error);
 *         }
 *       })
 *     )
 *   )
 * );
 * ```
 *
 * @param {LoggingHandler | LoggingHandlerFactory} handlerInit - The handler to use for logging.
 * @returns {Middleware} A middleware instance that provides logging capabilities.
 */
export function logging(
  handlerInit: LoggingHandler | LoggingHandlerFactory,
): Middleware {
  return async (request: Request, next: Handler): Promise<Response> => {
    const data: RequestLogData = { request };
    const handler = typeof handlerInit === "function"
      ? handlerInit(data)
      : handlerInit;

    try {
      await handler.onRequest?.(data);

      const response = await next(request);

      await handler.onResponse?.({ ...data, response });

      return response;
    } catch (error) {
      await handler.onCatch?.({ ...data, error: error as Error });

      throw error;
    }
  };
}
