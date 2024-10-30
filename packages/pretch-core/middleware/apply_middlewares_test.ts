import { expect } from "@std/expect/expect";
import type { Enhancer } from "@/types.ts";
import { applyMiddlewares } from "@/middleware/apply_middlewares.ts";
import { defaultHeadersMiddleware } from "@/middleware/default_headers.ts";
import { jwtMiddleware } from "@/middleware/jwt.ts";
import { retryMiddleware } from "@/middleware/retry.ts";
import { validateStatusMiddleware } from "@/middleware/validate_status.ts";

Deno.test("ApplyMiddlewares - Use multiple middlewares with fetch", async () => {
  const enhancer: Enhancer = applyMiddlewares(
    defaultHeadersMiddleware({
      defaultHeaders: {
        "Content-Type": "application/json",
      },
      strategy: "append",
    }),
    jwtMiddleware({
      token: "1234567890",
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
    expect(req.headers.has("Authorization")).toEqual(`Bearer 1234567890`);
    expect(req.headers.get("content-type")).toBe("application/json");
    return new Response("", { status: 200 });
  });

  await expect(inner(request)).rejects.toThrow();
});
