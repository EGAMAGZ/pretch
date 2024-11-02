import { expect } from "@std/expect/expect";
import { spy } from "@std/testing/mock";
import { validateStatus } from "@/middleware/validate_status.ts";

Deno.test("Validate Status Middleware - Throw error for status 200", async () => {
  const fetchSpy = spy((_request: Request) =>
    new Response(null, { status: 200 })
  );
  const middleware = validateStatus(
    (status) => status === 404,
  );

  const request = new Request(
    "https://example.com",
  );

  const getUser = () => middleware(request, (r) => fetchSpy(r));

  await expect(getUser()).rejects.toThrow();
});

Deno.test("Validate Status Middleware - No error for status 404", async () => {
  const fetchSpy = spy((_request: Request) =>
    new Response(null, { status: 404 })
  );

  const middleware = validateStatus(
    (status) => status === 404,
  );

  const request = new Request(
    "https://example.com",
  );

  const getUser = async () => {
    const response = await middleware(request, (r) => fetchSpy(r));
    await response.body?.cancel();
  };

  await expect(getUser()).resolves.not.toThrow();
});

Deno.test("Validate Status Middleware - Throw custom error with dumped body", async () => {
  const errorMessage = "Custom error message";

  let capturedResponse: unknown;

  const fetchSpy = spy((_request: Request) =>
    new Response(null, { status: 404 })
  );

  const middleware = validateStatus(
    (status) => 200 <= status && status <= 399,
    {
      errorFactory: (_status, _request, response) => {
        capturedResponse = response.body;
        return new Error(errorMessage);
      },
      shouldCancelBody: true,
    },
  );

  const request = new Request(
    "https://example.com",
  );

  const getUser = async () => {
    await middleware(request, (r) => fetchSpy(r));
  };

  await expect(getUser()).rejects.toThrow(errorMessage);
  expect(capturedResponse).toBeNull();
});
