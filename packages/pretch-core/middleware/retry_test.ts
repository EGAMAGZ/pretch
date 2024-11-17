import { expect } from "@std/expect/expect";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { FakeTime } from "@std/testing/time";
import { retry } from "@/middleware/retry.ts";
import { applyMiddlewares } from "@/middleware/apply_middlewares.ts";
import { validateStatus } from "@/middleware/validate_status.ts";

Deno.test("Retry middleware - should validate maxRetries is greater than zero", () => {
  expect(() => {
    retry({
      maxRetries: 0,
    });
  }).toThrow("Maximum number of retries must be greater than 0");

  expect(() => {
    retry({
      maxRetries: -100,
    });
  }).toThrow("Maximum number of retries must be greater than 0");
});

Deno.test("Retry middleware - should validate delay is greater than zero", () => {
  expect(() => {
    retry({
      delay: 0,
    });
  }).toThrow("Delay must be greater than 0");

  expect(() => {
    retry({
      delay: -100,
    });
  }).toThrow("Delay must be greater than 0");
});

Deno.test("Retry middleware - should complete successfully without retrying when first attempt succeeds", async () => {
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

  assertSpyCalls(fetchStub, 1);

  await response.body?.cancel();
});

Deno.test("Retry middleware - should exhaust all retry attempts before failing on persistent errors", async () => {
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

Deno.test("Retry middleware - should attempt retries up to maxRetries on non-200 responses", async () => {
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
  expect(status).toEqual(400);
});

Deno.test("Retry middleware - should skip retries for non-200 responses when whenNotOk is disabled", async () => {
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
  expect(ok).toEqual(false);
});

Deno.test("Retry middleware - should skip retries for exceptions when whenCatch is disabled", async () => {
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

Deno.test("Retry middleware - should skip retries for exceptions and non-200 responses when whenCatch and whenNotOk is disabled", async () => {
  using fetchStub = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async () => new Response(null, { status: 404 }),
  );

  const enhancer = applyMiddlewares(
    retry({
      delay: 1_000,
      maxRetries: 2,
      whenNotOk: false,
      whenCatch: false,
    }),
    validateStatus(),
  );

  const request = new Request("https://example.com");
  const inner = enhancer(fetch);

  await expect(inner(request)).rejects.toThrow(
    "Request failed with status 404",
  );

  assertSpyCalls(fetchStub, 1);
});
