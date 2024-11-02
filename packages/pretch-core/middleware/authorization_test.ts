import { expect } from "@std/expect/expect";
import { authorization } from "@/middleware/authorization.ts";

Deno.test("Authorization Middleware - Add token to all requests", () => {
  const token = "1234567890";
  const middleware = authorization(
    token,
    "bearer",
  );

  const request = new Request("http://example.com");

  middleware(request, (request: Request) => {
    expect(request.headers.get("Authorization")).toBe(`Bearer ${token}`);

    return new Response();
  });
});

Deno.test("Authorization Middleware - Conditionally add token for '/api/' paths", () => {
  const token = "1234567890";
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

  middleware(notApiRequest, (request: Request) => {
    expect(request.headers.has("Authorization")).toBe(false);

    return new Response();
  });

  const apiRequest = new Request(
    "https://example.com/api/example",
  );

  middleware(apiRequest, (request: Request) => {
    expect(request.headers.get("Authorization")).toEqual(`Bearer ${token}`);

    return new Response();
  });
});

Deno.test("Authorization Middleware - Check content of Basic credentials", () => {
  const token = "dXNlcjpwYXNzd29yZA==";

  const middleware = authorization(token, "basic");

  const request = new Request("https://example.com");

  middleware(request, (req: Request) => {
    expect(req.headers.get("Authorization")).toEqual(`Basic ${token}`);
    return new Response();
  });
});

Deno.test("Authorization Middleware - Check content of Digest credentials", () => {
  const credentials =
    'username="usuario",realm="example.com",nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093",uri="/protected/resource",response="6629fae49393a05397450978507c4ef1",opaque="5ccc069c403ebaf9f0171e9517f40e41",qop=auth,nc=00000001,cnonce="0a4f113b"';

  const middleware = authorization(credentials, "digest");

  const request = new Request("https://example.com");

  middleware(request, (req: Request) => {
    expect(req.headers.get("Authorization")).toEqual(`Digest ${credentials}`);
    return new Response();
  });
});

Deno.test("Authorization Middleware - Check content of OAuth credentials", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  const middleware = authorization(token, "oauth");

  const request = new Request("https://example.com");

  middleware(request, (req: Request) => {
    expect(req.headers.get("Authorization")).toEqual(`Bearer ${token}`);
    return new Response();
  });
});

Deno.test("Authorization Middleware - Check content of API key credentials", () => {
  const token = "123456789abcdef";

  const middleware = authorization(
    token,
    "apikey",
  );

  const request = new Request("https://example.com");

  middleware(request, (req: Request) => {
    expect(req.headers.get("Authorization")).toEqual(`Apikey ${token}`);
    return new Response();
  });
});

Deno.test("Authorization Middleware - Check content of JWT credentials", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  const middleware = authorization(token, "jwt");

  const request = new Request("https://example.com");

  middleware(request, (req: Request) => {
    expect(req.headers.get("Authorization")).toEqual(`Bearer ${token}`);
    return new Response();
  });
});

Deno.test("Authorization Middleware - Check content of Bearer credentials", () => {
  const token = "mF_9.B5f-4.1JqM";

  const middleware = authorization(token, "bearer");

  const request = new Request("https://example.com");

  middleware(request, (req: Request) => {
    expect(req.headers.get("Authorization")).toEqual(`Bearer ${token}`);
    return new Response();
  });
});
