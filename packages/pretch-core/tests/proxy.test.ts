import { proxy } from "@/middleware/proxy.ts";
import { stub } from "@std/testing/mock";
import { expect } from "@std/expect";
Deno.test("Proxy middleware - forwards request to target URL", async (ctx) => {
  let capturedRequest: Request | null = null;
  using _fetchStub = stub(
    globalThis,
    "fetch", // deno-lint-ignore require-await
    async (init: RequestInfo | URL, _input?: RequestInit) => {
      capturedRequest = init as Request;
      return new Response("proxied response", { status: 200 });
    },
  );
  const middleware = proxy("https://api.target.com", "/path");

  await ctx.step("forwards request to target URL", async () => {
    const request = new Request("https://original.com/path", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer token123",
      },
    });
    const response = await middleware(request, fetch);

    expect(capturedRequest?.url).toEqual("https://api.target.com/path");
    expect(capturedRequest?.redirect).toEqual("manual");

    const headerObj = Object.fromEntries(capturedRequest?.headers ?? []);
    expect(headerObj).toMatchObject({
      "host": "api.target.com",
      "content-type": "application/json",
      "authorization": "Bearer token123",
    });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("proxied response");
  });

  await ctx.step("skips non-matching paths", async () => {
    const request = new Request("https://original.com/other-path", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer token123",
      },
    });
    const response = await middleware(request, fetch);

    expect(capturedRequest?.url).toEqual("https://original.com/other-path");

    const headerObj = Object.fromEntries(capturedRequest?.headers ?? []);
    expect(headerObj).toMatchObject({
      "content-type": "application/json",
      "authorization": "Bearer token123",
    });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("proxied response");
  });
});

Deno.test("Proxy middleware - applies path rewrite", async () => {
  let capturedRequest: Request | null = null;
  using _fetchStub = stub(
    globalThis,
    "fetch", // deno-lint-ignore require-await
    async (init: RequestInfo | URL, _input?: RequestInit) => {
      capturedRequest = init as Request;
      return new Response("proxied response", { status: 200 });
    },
  );

  const middleware = proxy("https://api.target.com", "/api", {
    pathRewrite: (path) => path.replace(/\/api\//, "/v1/"),
  });
  const request = new Request("https://original.com/api/resources");

  const response = await middleware(request, fetch);

  expect(capturedRequest!.url).toEqual("https://api.target.com/v1/resources");

  expect(response.status).toEqual(200);
  expect(await response.text()).toEqual("proxied response");
});

Deno.test("Proxy middleware - handles multiple path patterns correctly", async (ctx) => {
  let capturedRequest: Request | null = null;

  using _fetchStub = stub(
    globalThis,
    "fetch", // deno-lint-ignore require-await
    async (init: RequestInfo | URL, _input?: RequestInit) => {
      capturedRequest = init as Request;
      return new Response("proxied response", { status: 200 });
    },
  );

  const middleware = proxy("https://api.target.com", ["/path", "/other-path"]);

  await ctx.step(
    "forwards first matching path pattern to target URL",
    async () => {
      const request = new Request("https://original.com/path");

      const _response = await middleware(request, fetch);

      expect(capturedRequest?.url).toEqual("https://api.target.com/path");
    },
  );

  await ctx.step(
    "forwards second matching path pattern to target URL",
    async () => {
      const request = new Request("https://original.com/other-path");

      const _response = await middleware(request, fetch);

      expect(capturedRequest?.url).toEqual("https://api.target.com/other-path");
    },
  );

  await ctx.step("preserves original URL for non-matching paths", async () => {
    const request = new Request("https://original.com/resource");

    const _response = await middleware(request, fetch);

    expect(capturedRequest?.url).toEqual("https://original.com/resource");
  });
});
