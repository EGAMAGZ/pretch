import { jwtMiddleware } from "@/middleware/jwt.ts";
import { defaultHeadersMiddleware } from "@/middleware/default-headers.ts";
import { validateStatusMiddleware } from "@/middleware/validate-status.ts";
import { expect } from "@std/expect/expect";
import { assertSpyCalls, spy } from "@std/testing/mock";
import { FakeTime } from "@std/testing/time";
import { retryMiddleware } from "@/middleware/retry.ts";
import { applyMiddlewares } from "@/middleware/apply-middlewares.ts";
import type { Enhancer } from "@/types.ts";

Deno.test("Set default headers with set strategy - DefaultHeadersMiddleware", () => {
  const middleware = defaultHeadersMiddleware({
    defaultHeaders: {
      "Content-Type": "application/json",
    },
    strategy: "set",
  });

  const request = new Request("https://jsonplaceholder.typicode.com/users/10", {
    headers: {
      "Content-Type": "text/html",
    },
  });

  middleware(request, (request: Request) => {
    expect(request.headers.get("Content-Type")).toBe("application/json");
    return new Response();
  });
});

Deno.test("Set default headers with append strategy - DefaultHeadersMiddleware", () => {
  const middleware = defaultHeadersMiddleware({
    defaultHeaders: {
      "Content-Type": "application/json",
    },
    strategy: "append",
  });

  const request = new Request("https://jsonplaceholder.typicode.com/users/10");

  middleware(request, (request: Request) => {
    expect(request.headers.get("Content-Type")).toBe("application/json");
    return new Response();
  });
});

Deno.test("Add token to all urls - JwtMiddleware", () => {
  const token = "1234567890";
  const middleware = jwtMiddleware({
    token,
  });

  const request = new Request("https://jsonplaceholder.typicode.com/users/10");

  middleware(request, (request: Request) => {
    expect(request.headers.get("Authorization")).toBe(`Bearer ${token}`);

    return new Response();
  });
});

Deno.test("Add token to urls that starts with '/api/' - JwtMiddleware", () => {
  const token = "1234567890";
  const middleware = jwtMiddleware({
    token,
    shouldApplyToken: (request: Request) =>
      new URL(request.url).pathname.startsWith("/api/"),
  });

  const notApiRequest = new Request(
    "https://jsonplaceholder.typicode.com/users/10",
  );

  middleware(notApiRequest, (request: Request) => {
    expect(request.headers.has("Authorization")).toBe(false);

    return new Response();
  });

  const apiRequest = new Request(
    "https://jsonplaceholder.typicode.com/api/users/10",
  );

  middleware(apiRequest, (request: Request) => {
    expect(request.headers.get("Authorization")).toBe(`Bearer ${token}`);

    return new Response();
  });
});

Deno.test("Fetch existing user (returns status code 200) - ValidateStatusMiddleware", async () => {
  const middleware = validateStatusMiddleware({
    validateStatus: (status) => status === 404,
  });

  const request = new Request(
    "https://jsonplaceholder.typicode.com/users/10",
  );

  const getUser = () => middleware(request, (r) => fetch(r));

  await expect(getUser()).rejects.toThrow();
});

Deno.test("Fetch not existing user (returns status code 404) - ValidateStatusMiddleware", async () => {
  const middleware = validateStatusMiddleware({
    validateStatus: (status) => status === 404,
  });

  const request = new Request(
    "https://jsonplaceholder.typicode.com/users/11",
  );

  const getUser = async () => {
    const response = await middleware(request, (r) => fetch(r));
    await response.body?.cancel();
  };

  await expect(getUser()).resolves.not.toThrow();
});

Deno.test("Fetch user successfully with one retry - RetryMiddleware", async () => {
  const fetchSpy = spy((_request: Request) =>
    new Response("", { status: 200 })
  );

  const middleware = retryMiddleware({
    maxRetries: 2,
    delay: 1_000,
  });

  const request = new Request("https://jsonplaceholder.typicode.com/users/1");

  const response = await middleware(request, (r) => fetchSpy(r));
  await response.body?.cancel();

  assertSpyCalls(fetchSpy, 1); // FIXME: Find a way to use expect instead of assert
});

Deno.test("Fetch user unsuccessfully with two retries - RetryMiddleware", async () => {
  using time = new FakeTime();
  const fetchSpy = spy((_request: Request) => {
    throw new Error("Some error while fetching");
  });

  const middleware = retryMiddleware({
    maxRetries: 2,
    delay: 1_000,
  });

  const request = new Request("https://jsonplaceholder.typicode.com/users/1");
  const middlewarePromise = middleware(
    request,
    fetchSpy,
  );

  await time.tickAsync(2_000);
  expect(middlewarePromise).rejects.toThrow();

  assertSpyCalls(fetchSpy, 2);
});

Deno.test("Chaining multiple middlewares - ApplyMiddlewares", async () => {
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

  const request = new Request("https://jsonplaceholder.typicode.com/users/1");

  const inner = enhancer((req: Request) => {
    expect(req.headers.has("Authorization")).toBe(true);
    expect(req.headers.get("content-type")).toBe("application/json");
    return new Response("", { status: 200 });
  });

  await expect(inner(request)).rejects.toThrow();
});
