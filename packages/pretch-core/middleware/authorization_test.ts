import { expect } from "@std/expect/expect";
import { authorization } from "@/middleware/authorization.ts";
import { stub } from "@std/testing/mock";

Deno.test("Authorization middleware - should add bearer token to all requests by default", () => {
  const token = "1234567890";

  let capturedHeaders = new Headers();
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async (input, init) => {
      capturedHeaders = new Request(input, init).headers;
      return new Response();
    },
  );

  const middleware = authorization(
    token,
    "bearer",
  );

  const request = new Request("http://example.com");

  middleware(request, fetch);

  expect(capturedHeaders.get("Authorization")).toEqual(`Bearer ${token}`);
});

Deno.test("Authorization middleware - should selectively add token based on URL path", () => {
  const token = "1234567890";

  let capturedHeaders = new Headers();
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async (input, init) => {
      capturedHeaders = new Request(input, init).headers;
      return new Response();
    },
  );

  const middleware = authorization(
    token,
    "bearer",
    {
      shouldApplyToken: (request: Request) =>
        new URL(request.url).pathname.startsWith("/api/"),
    },
  );

  const notApiRequest = new Request(
    "https://example.com",
  );

  middleware(notApiRequest, fetch);

  expect(capturedHeaders.has("Authorization")).toEqual(false);

  const apiRequest = new Request(
    "https://example.com/api/example",
  );

  middleware(apiRequest, fetch);

  expect(capturedHeaders.get("Authorization")).toEqual(`Bearer ${token}`);
});

Deno.test("Authorization middleware - should correctly format Basic authentication header", () => {
  const token = "dXNlcjpwYXNzd29yZA==";

  let capturedHeaders = new Headers();
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async (input, init) => {
      capturedHeaders = new Request(input, init).headers;
      return new Response();
    },
  );

  const middleware = authorization(token, "basic");

  const request = new Request("https://example.com");

  middleware(request, fetch);
  expect(capturedHeaders.get("Authorization")).toEqual(`Basic ${token}`);
});

Deno.test("Authorization middleware - should correctly format Digest authentication header", () => {
  const credentials =
    'username="usuario",realm="example.com",nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093",uri="/protected/resource",response="6629fae49393a05397450978507c4ef1",opaque="5ccc069c403ebaf9f0171e9517f40e41",qop=auth,nc=00000001,cnonce="0a4f113b"';

  let capturedHeaders = new Headers();
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async (input, init) => {
      capturedHeaders = new Request(input, init).headers;
      return new Response();
    },
  );

  const middleware = authorization(credentials, "digest");

  const request = new Request("https://example.com");

  middleware(request, fetch);
  expect(capturedHeaders.get("Authorization")).toEqual(`Digest ${credentials}`);
});

Deno.test("Authorization middleware - should correctly format OAuth token header", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  let capturedHeaders = new Headers();
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async (input, init) => {
      capturedHeaders = new Request(input, init).headers;
      return new Response();
    },
  );

  const middleware = authorization(token, "oauth");

  const request = new Request("https://example.com");

  middleware(request, fetch);
  expect(capturedHeaders.get("Authorization")).toEqual(`Bearer ${token}`);
});

Deno.test("Authorization middleware - should correctly format API key header", () => {
  const token = "123456789abcdef";

  let capturedHeaders = new Headers();
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async (input, init) => {
      capturedHeaders = new Request(input, init).headers;
      return new Response();
    },
  );

  const middleware = authorization(
    token,
    "apikey",
  );

  const request = new Request("https://example.com");

  middleware(request, fetch);

  expect(capturedHeaders.get("Authorization")).toEqual(`Apikey ${token}`);
});

Deno.test("Authorization middleware - should correctly format JWT token header", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  let capturedHeaders = new Headers();
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async (input, init) => {
      capturedHeaders = new Request(input, init).headers;
      return new Response();
    },
  );

  const middleware = authorization(token, "jwt");

  const request = new Request("https://example.com");

  middleware(request, fetch);

  expect(capturedHeaders.get("Authorization")).toEqual(`Bearer ${token}`);
});

Deno.test("Authorization middleware - should correctly format Bearer token header", () => {
  const token = "mF_9.B5f-4.1JqM";

  let capturedHeaders = new Headers();
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async (input, init) => {
      capturedHeaders = new Request(input, init).headers;
      return new Response();
    },
  );

  const middleware = authorization(token, "bearer");

  const request = new Request("https://example.com");

  middleware(request, fetch);

  expect(capturedHeaders.get("Authorization")).toEqual(`Bearer ${token}`);
});
