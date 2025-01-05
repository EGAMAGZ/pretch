import { expect } from "@std/expect/expect";
import { spy, stub } from "@std/testing/mock";
import { validateStatus } from "@/middleware/validate_status.ts";

Deno.test("Validate status middleware - should reject responses with unexpected status codes", async () => {
  using _ = stub(
    globalThis,
    "fetch", // deno-lint-ignore require-await
    async () => new Response(null),
  );
  const middleware = validateStatus({
    validate: (status) => status === 404,
  });

  const request = new Request(
    "https://example.com",
  );

  const getUser = () => middleware(request, fetch);

  await expect(getUser()).rejects.toThrow();
});

Deno.test("Validate status middleware - should accept responses with expected status codes", async () => {
  const fetchSpy = spy((_request: Request) =>
    new Response(null, { status: 404 })
  );

  const middleware = validateStatus({
    validate: (status) => status === 404,
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

Deno.test("Validate status middleware - should support custom error handling with body cleanup", async () => {
  const errorMessage = "Custom error message";

  let capturedResponse: unknown;

  const fetchSpy = spy((_request: Request) =>
    new Response(null, { status: 404 })
  );

  const middleware = validateStatus({
    validate: (status) => 200 <= status && status <= 399,
    errorFactory: (_status, _request, response) => {
      capturedResponse = response.body;
      return new Error(errorMessage);
    },
    shouldCancelBody: true,
  });

  const request = new Request(
    "https://example.com",
  );

  const getUser = async () => {
    await middleware(request, (r) => fetchSpy(r));
  };

  await expect(getUser()).rejects.toThrow(errorMessage);
  expect(capturedResponse).toBeNull();
});
