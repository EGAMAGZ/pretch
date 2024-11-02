import { expect } from "@std/expect/expect";
import type { Enhancer } from "@/types.ts";
import { applyMiddlewares } from "@/middleware/apply_middlewares.ts";
import { defaultHeaders } from "@/middleware/default_headers.ts";
import { authorization } from "./authorization.ts";
import { retry } from "@/middleware/retry.ts";
import { validateStatus } from "@/middleware/validate_status.ts";

Deno.test("ApplyMiddlewares - Use multiple middlewares with fetch", async () => {
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
    validateStatus(
      (status) => status === 404,
    ),
    retry({
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
