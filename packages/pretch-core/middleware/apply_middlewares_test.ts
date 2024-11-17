import { expect } from "@std/expect/expect";
import type { Enhancer } from "@/types.ts";
import { applyMiddlewares } from "@/middleware/apply_middlewares.ts";
import { defaultHeaders } from "@/middleware/default_headers.ts";
import { authorization } from "@/middleware/authorization.ts";
import { retry } from "@/middleware/retry.ts";
import { validateStatus } from "@/middleware/validate_status.ts";
import { stub } from "@std/testing/mock";

Deno.test("applyMiddlewares - should correctly chain multiple middleware configurations", async () => {
  let capturedHeaders = new Headers();

  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async (input, init) => {
      const request = new Request(input, init);
      capturedHeaders = request.headers;
      return new Response(null);
    },
  );

  const enhancer: Enhancer = applyMiddlewares(
    defaultHeaders(
      {
        "Content-Type": "application/json",
      },
      {
        strategy: "append",
      },
    ),
    authorization(
      "1234567890",
      "bearer",
    ),
    validateStatus({
      validate: (status) => status === 404,
    }),
    retry({
      delay: 1_000,
      maxRetries: 2,
    }),
  );

  const request = new Request("http://example.com");

  const inner = enhancer(fetch);

  await expect(inner(request)).rejects.toThrow();

  expect(capturedHeaders.get("Authorization")).toEqual(
    `Bearer 1234567890`,
  );
  expect(capturedHeaders.get("content-type")).toEqual(
    "application/json",
  );
});
