import { expect } from "@std/expect/expect";
import { assertSpyCalls, spy, stub } from "@std/testing/mock";
import { FakeTime } from "@std/testing/time";
import { retry } from "@/middleware/retry.ts";
import { applyMiddlewares } from "@/middleware/apply_middlewares.ts";
import { validateStatus } from "@/middleware/validate_status.ts";

Deno.test("Retry Middleware - Throw error when maxRetries is lower than 1", () => {
  expect(() => {
    retry({
      maxRetries: 0,
    });
  }).toThrow(Error);
});

Deno.test("Retry Middleware - Throw error when delay is lower than 1", () => {
  expect(() => {
    retry({
      delay: 0,
    });
  }).toThrow(Error);
});

Deno.test("Retry Middleware - Fetch succesfully with one retry", async () => {
  using fetchStub = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async () => new Response(null, { status: 200 }),
  );

  const middleware = retry({
    maxRetries: 2,
    delay: 1_000,
  });

  const request = new Request("https://example.com");

  const response = await middleware(request, fetch);
  await response.body?.cancel();

  assertSpyCalls(fetchStub, 1);
});

Deno.test("Retry Middleware - Fail to fetch after two retries", async () => {
  using time = new FakeTime();
  using fetchStub = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async () => {
      throw new Error("Some error while fetching");
    },
  );

  const middleware = retry({
    maxRetries: 2,
    delay: 1_000,
  });

  const request = new Request("https://example.com");
  const response = middleware(
    request,
    fetch,
  );

  await time.tickAsync(2_000);
  expect(response).rejects.toThrow();

  assertSpyCalls(fetchStub, 2);
});

Deno.test("Retry Middleware - Retry to fetch two times when status code is not ok", async () => {
  using time = new FakeTime();
  using fetchStub = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async () => new Response(null, { status: 400 }),
  );

  const middleware = retry({
    maxRetries: 2,
    delay: 1_000,
  });

  const request = new Request("https://example.com");
  const response = middleware(request, (req) => fetch(req));

  await time.tickAsync(2_000);

  assertSpyCalls(fetchStub, 2);

  const { body, status } = await response;
  expect(body).toBeNull();
  expect(status).toBe(400);
});

Deno.test("Retry Middleware - Fetch successfully with one retry when status code is not ok", async () => {
  using time = new FakeTime();
  using fetchStub = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async () => new Response(null, { status: 400 }),
  );

  const middleware = retry({
    maxRetries: 2,
    delay: 1_000,
    whenNotOk: false,
  });

  const request = new Request("https://example.com");
  const response = middleware(request, fetch);

  await time.tickAsync(2_000);

  assertSpyCalls(fetchStub, 1);

  const { body, ok } = await response;
  expect(body).toBeNull();
  expect(ok).toBe(false);
});

Deno.test("Retry Middleware - Avoid retry to fetch when an exception is thrown", async () => {
  using fetchStub = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async () => {
      throw new Error("Some error while fetching");
    },
  );

  const middleware = retry({
    maxRetries: 2,
    delay: 1_000,
    whenCatch: false,
  });

  const request = new Request("https://example.com");
  const response = middleware(request, fetch);

  await expect(response).rejects.toThrow();

  assertSpyCalls(fetchStub, 1);
});
