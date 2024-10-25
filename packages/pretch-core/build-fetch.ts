import type { CustomFetch, Enhancer, Handler } from "@/types.ts";

/**
 * Creates a custom fetch function with optional middleware enhancement.
 *
 * @param {Enhancer} [enhancer] - An optional function to enhance the fetch behavior.
 * @returns {CustomFetch} A custom fetch function that applies the enhancer, if provided.
 */
export function buildFetch(enhancer?: Enhancer): CustomFetch {
  let innerFetch: Handler = (request) => fetch(request);

  if (enhancer) {
    innerFetch = enhancer(innerFetch);
  }

  return (url: string | URL, options?: RequestInit) =>
    Promise.resolve(innerFetch(new Request(url, options)));
}
