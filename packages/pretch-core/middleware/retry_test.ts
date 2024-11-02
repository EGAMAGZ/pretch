import { expect } from "@std/expect/expect";
import { assertSpyCalls, spy } from "@std/testing/mock";
import { FakeTime } from "@std/testing/time";
import { retry } from "@/middleware/retry.ts";

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
  const fetchSpy = spy((_request: Request) =>
    new Response("", { status: 200 })
  );

  const middleware = retry({
    maxRetries: 2,
    delay: 1_000,
  });

  const request = new Request("http://example.com");

  const response = await middleware(request, (r) => fetchSpy(r));
  await response.body?.cancel();

  assertSpyCalls(fetchSpy, 1); // FIXME: Find a way to use expect instead of assert
});

Deno.test("Retry Middleware - Fail to fetch after two retries", async () => {
  using time = new FakeTime();
  const fetchSpy = spy((_request: Request) => {
    throw new Error("Some error while fetching");
  });

  const middleware = retry({
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
