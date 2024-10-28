import { buildFetch } from "@/build-fetch.ts";
import { expect } from "@std/expect";
import { stub } from "@std/testing/mock";
import { applyMiddlewares } from "@/middleware/apply-middlewares.ts";
import { validateStatusMiddleware } from "@/middleware/validate-status.ts";
import { defaultHeadersMiddleware } from "@/middleware/default-headers.ts";
import { jwtMiddleware } from "@/middleware/jwt.ts";

type Todo = { userId: number; id: number; title: string; completed: boolean };

const expectedTodo: Todo = {
  userId: 1,
  id: 1,
  title: "delectus aut autem",
  completed: false,
};

Deno.test("Build fetch - Sucessful fetch with async data", async (ctx) => {
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async () => Response.json(expectedTodo),
  );

  const customFetch = buildFetch();
  const response = await customFetch(
    "https://example.com",
  );

  await ctx.step("Status code should indicate success", () => {
    expect(response.ok).toEqual(true);
  });

  await ctx.step("Response JSON should match expected Todo", async () => {
    const body = await response.json() as Todo;
    expect(body).toEqual(expectedTodo);
  });
});

Deno.test("Build fetch - Unsuccessful fetch with async data", async () => {
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async () => new Response(null, { status: 404 }),
  );

  const customFetch = buildFetch();
  const response = await customFetch("https://example.com");

  expect(response.ok).toEqual(false);
  await response.body?.cancel();
});

Deno.test("Build fetch - Successfully fetch applying middlewares", () => {
  let capturedHeaders = new Headers();
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async (_input, init) => {
      const request = new Request(_input, init);
      capturedHeaders = request.headers;
      return new Response(null, { status: 404 });
    },
  );

  const customFetch = buildFetch(applyMiddlewares(
    validateStatusMiddleware({
      validateStatus: (status) => status === 404,
    }),
    defaultHeadersMiddleware({
      defaultHeaders: {
        "Content-Type": "application/json",
      },
      strategy: "append",
    }),
    jwtMiddleware({
      token: "1234567890",
      shouldApplyToken: (request) =>
        new URL(request.url).pathname.startsWith("/api/"),
    }),
  ));

  const response = customFetch("https://example.com/api/user/11", {
    method: "GET",
  });

  expect(capturedHeaders.get("Authorization")).toBe("Bearer 1234567890");
  expect(capturedHeaders.get("Content-type")).toBe("application/json");

  expect(response).resolves.not.toThrow();
});
