import { buildFetch } from "@/build_fetch.ts";
import { expect } from "@std/expect";
import { stub } from "@std/testing/mock";
import { applyMiddlewares } from "@/middleware/apply_middlewares.ts";
import { validateStatus } from "@/middleware/validate_status.ts";
import { defaultHeaders } from "@/middleware/default_headers.ts";
import { authorization } from "@/middleware/authorization.ts";

type Todo = { userId: number; id: number; title: string; completed: boolean };

const expectedTodo: Todo = {
  userId: 1,
  id: 1,
  title: "delectus aut autem",
  completed: false,
};

Deno.test("Build fetch - should successfully handle async JSON responses", async (ctx) => {
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

  expect(response.ok).toEqual(true);
  const body = await response.json() as Todo;
  expect(body).toEqual(expectedTodo);
});

Deno.test("Build fetch - should handle unsuccessful responses appropriately", async () => {
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

Deno.test("Build fetch - should correctly apply multiple middleware configurations", () => {
  let capturedHeaders = new Headers();
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async (input, init) => {
      const request = new Request(input, init);
      capturedHeaders = request.headers;
      return new Response(null, { status: 404 });
    },
  );

  const customFetch = buildFetch(applyMiddlewares(
    validateStatus({
      validate: (status) => status === 404,
    }),
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
      {
        shouldApplyToken: (request) =>
          new URL(request.url).pathname.startsWith("/api/"),
      },
    ),
  ));

  const response = customFetch("https://example.com/api/user/11", {
    method: "GET",
  });

  expect(capturedHeaders.get("Authorization")).toEqual("Bearer 1234567890");
  expect(capturedHeaders.get("Content-type")).toEqual("application/json");

  expect(response).resolves.not.toThrow();
});
