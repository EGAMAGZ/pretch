import { expect } from "@std/expect/expect";
import { defaultHeaders } from "@/middleware/default_headers.ts";
import { stub } from "@std/testing/mock";

Deno.test("Default Headers middleware - should override existing headers when using 'set' strategy", () => {
  let capturedHeaders = new Headers();
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async (input, init) => {
      capturedHeaders = new Request(input, init).headers;
      return new Response(null);
    },
  );

  const middleware = defaultHeaders(
    {
      "Content-Type": "application/json",
    },
    {
      strategy: "set",
    },
  );

  const request = new Request("https://example.com", {
    headers: {
      "Content-Type": "text/html",
    },
  });

  middleware(request, fetch);

  expect(capturedHeaders.get("Content-Type")).toEqual(
    "application/json",
  );
});

Deno.test("Default Headers middleware - should add missing headers when using 'append' strategy", () => {
  let capturedHeaders = new Headers();
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async (input, init) => {
      capturedHeaders = new Request(input, init).headers;
      return new Response(null);
    },
  );
  const middleware = defaultHeaders(
    {
      "Content-Type": "application/json",
    },
    {
      strategy: "append",
    },
  );

  const request = new Request("https://example.com");

  middleware(request, fetch);

  expect(capturedHeaders.get("Content-Type")).toEqual(
    "application/json",
  );
});
