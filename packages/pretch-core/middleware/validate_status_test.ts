import { expect } from "@std/expect/expect";
import { spy } from "@std/testing/mock";
import { validateStatusMiddleware } from "@/middleware/validate_status.ts";

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
