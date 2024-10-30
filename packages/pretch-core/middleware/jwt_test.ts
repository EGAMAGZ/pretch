import { expect } from "@std/expect/expect";
import { jwtMiddleware } from "@/middleware/jwt.ts";

Deno.test("JwtMiddleware - Add token to all requests", () => {
  const token = "1234567890";
  const middleware = jwtMiddleware({
    token,
  });

  const request = new Request("http://example.com");

  middleware(request, (request: Request) => {
    expect(request.headers.get("Authorization")).toBe(`Bearer ${token}`);

    return new Response();
  });
});

Deno.test("JwtMiddleware - Conditionally add token for '/api/' paths", () => {
  const token = "1234567890";
  const middleware = jwtMiddleware({
    token,
    shouldApplyToken: (request: Request) =>
      new URL(request.url).pathname.startsWith("/api/"),
  });

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
    expect(request.headers.get("Authorization")).toBe(`Bearer ${token}`);

    return new Response();
  });
});
