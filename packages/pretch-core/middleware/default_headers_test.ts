import { expect } from "@std/expect/expect";
import { defaultHeadersMiddleware } from "@/middleware/default_headers.ts";

Deno.test("DefaultHeadersMiddleware - Apply headers with 'set' strategy", () => {
  const middleware = defaultHeadersMiddleware(
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

  middleware(request, (request: Request) => {
    expect(request.headers.get("Content-Type")).toBe("application/json");
    return new Response();
  });
});

Deno.test("DefaultHeadersMiddleware - Apply headers with 'append' strategy", () => {
  const middleware = defaultHeadersMiddleware(
    {
      "Content-Type": "application/json",
    },
    {
      strategy: "append",
    },
  );

  const request = new Request("https://example.com");

  middleware(request, (request: Request) => {
    expect(request.headers.get("Content-Type")).toBe("application/json");
    return new Response();
  });
});
