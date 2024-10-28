import { jwtMiddleware } from "@/middleware/jwt.ts";
import { defaultHeadersMiddleware } from "@/middleware/default-headers.ts";
import { validateStatusMiddleware } from "@/middleware/validate-status.ts";
import { expect } from "@std/expect/expect";
import { assertSpyCalls, spy } from "@std/testing/mock";
import { FakeTime } from "@std/testing/time";
import { retryMiddleware } from "@/middleware/retry.ts";
import { applyMiddlewares } from "@/middleware/apply-middlewares.ts";
import type { Enhancer } from "@/types.ts";

Deno.test("DefaultHeadersMiddleware - Apply headers with 'set' strategy", () => {
  const middleware = defaultHeadersMiddleware({
    defaultHeaders: {
      "Content-Type": "application/json",
    },
    strategy: "set",
  });

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
  const middleware = defaultHeadersMiddleware({
    defaultHeaders: {
      "Content-Type": "application/json",
    },
    strategy: "append",
  });

  const request = new Request("https://example.com");

  middleware(request, (request: Request) => {
    expect(request.headers.get("Content-Type")).toBe("application/json");
    return new Response();
  });
});

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

Deno.test("ValidateStatusMiddleware - Throw error for status 200", async () => {
  const fetchSpy = spy((_request: Request) =>
    new Response("", { status: 200 })
  );
  const middleware = validateStatusMiddleware({
    validateStatus: (status) => status === 404,
  });

  const request = new Request(
    "https://example.com",
  );

  const getUser = () => middleware(request, (r) => fetchSpy(r));

  await expect(getUser()).rejects.toThrow();
});

Deno.test("ValidateStatusMiddleware - No error for status 404", async () => {
  const fetchSpy = spy((_request: Request) =>
    new Response("", { status: 404 })
  );
  const middleware = validateStatusMiddleware({
    validateStatus: (status) => status === 404,
  });

  const request = new Request(
    "https://example.com",
  );

  const getUser = async () => {
    const response = await middleware(request, (r) => fetchSpy(r));
    await response.body?.cancel();
  };

  await expect(getUser()).resolves.not.toThrow();
});

Deno.test("RetryMiddleware - Fetch succesfully with one retry", async () => {
  const fetchSpy = spy((_request: Request) =>
    new Response("", { status: 200 })
  );

  const middleware = retryMiddleware({
    maxRetries: 2,
    delay: 1_000,
  });

  const request = new Request("http://example.com");

  const response = await middleware(request, (r) => fetchSpy(r));
  await response.body?.cancel();

  assertSpyCalls(fetchSpy, 1); // FIXME: Find a way to use expect instead of assert
});

Deno.test("RetryMiddleware - Fail to fetch after two retries", async () => {
  using time = new FakeTime();
  const fetchSpy = spy((_request: Request) => {
    throw new Error("Some error while fetching");
  });

  const middleware = retryMiddleware({
    maxRetries: 2,
    delay: 1_000,
  });

  const request = new Request("http://example.com");
  const middlewarePromise = middleware(
    request,
    fetchSpy,
  );

  await time.tickAsync(2_000);
  expect(middlewarePromise).rejects.toThrow();

  assertSpyCalls(fetchSpy, 2);
});

Deno.test("ApplyMiddlewares - Use multiple middlewares with fetch", async () => {
  const enhancer: Enhancer = applyMiddlewares(
    defaultHeadersMiddleware({
      defaultHeaders: {
        "Content-Type": "application/json",
      },
      strategy: "append",
    }),
    jwtMiddleware({
      token: "XXXXXXXXXXXXXXXX",
    }),
    validateStatusMiddleware({
      validateStatus: (status) => status === 404,
    }),
    retryMiddleware({
      delay: 1_000,
      maxRetries: 2,
    }),
  );

  const request = new Request("http://example.com");

  const inner = enhancer((req: Request) => {
    expect(req.headers.has("Authorization")).toBe(true);
    expect(req.headers.get("content-type")).toBe("application/json");
    return new Response("", { status: 200 });
  });

  await expect(inner(request)).rejects.toThrow();
});
