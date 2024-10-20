import type { Enhancer, Handler } from "@/types.ts";

/**
 * Builds a fetch function that can be enhanced with middleware.
 *
 * @param {Enhancer} [enhancer] - An enhancer that takes a fetch function and returns
 *   a new fetch function with added functionality.
 * @returns {typeof fetch} A fetch function that can be used to make requests.
 */
export function buildFetch(enhancer?: Enhancer) {
  let innerFetch: Handler = (request) => fetch(request);

  if (enhancer) {
    innerFetch = enhancer(innerFetch);
  }

  return (url: string | URL, options?: RequestInit) =>
    Promise.resolve(innerFetch(new Request(url, options)));
}
