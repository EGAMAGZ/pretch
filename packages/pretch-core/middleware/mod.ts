/**
 * # Middleware Module
 *
 * This module provides a powerful middleware system for enhancing fetch behavior through composable functions.
 * It includes both a middleware application utility and several pre-built middleware functions for common use cases.
 *
 * The {@link applyMiddleware} function that combines multiple middlewares into a single enhancer. The middlewares are
 * executed in the order they are provided, allowing for request/response transformation.
 *
 * ## Built-in Middlewares
 *
 * ### Authentication & Headers
 * - {@link authorization} - Adds authentication headers with support for multiple schemes (Bearer, Basic, JWT, etc.)
 * - {@link defaultHeaders} - Manages default headers with flexible append/set strategies
 *
 * ### Request Handling
 * - {@link validateStatus} - Validates response status codes with custom error handling
 * - {@link retry} - Implements retry logic for failed requests with configurable delays
 *
 * ### Logging Handling
 * - {@link logging} - Provides logging capabilities at different stages of request processing
 *
 * ### Proxy Handling
 * - {@link proxy} - Enables proxying requests through a specified proxy server
 *
 * ## Usage Example
 *
 * ```ts
 * import pretch from "@pretch/core";
 * import {
 *   applyMiddleware,
 *   authorization,
 *   defaultHeaders,
 *   validateStatus
 * } from "@pretch/core/middleware";
 *
 * const customFetch = pretch(
 *   applyMiddleware(
 *     // Middlewares are executed in order
 *     defaultHeaders({ "Content-Type": "application/json" }),
 *     authorization("token", "bearer"),
 *     validateStatus({ validate: status => status < 400 })
 *   )
 * );
 * ```
 *
 * @module
 */
export * from "@/middleware/apply_middlewares.ts";
export * from "@/middleware/authorization.ts";
export * from "@/middleware/default_headers.ts";
export * from "@/middleware/validate_status.ts";
export * from "@/middleware/retry.ts";
export * from "@/middleware/logging.ts";
export * from "@/middleware/proxy.ts";
