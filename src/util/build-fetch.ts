import type { Enhancer, Handler } from "@/types.ts";

export function buildFetch(enhance?: Enhancer) {
  let inner: Handler = (request: Request) => fetch(request);

  if (enhance) {
    inner = enhance(inner);
  }

  return (url: string | URL, options?: RequestInit) =>
    Promise.resolve(inner(new Request(url, options)));
}
