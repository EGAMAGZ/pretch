import { buildFetch } from "@/build-fetch.ts";
import { expect } from "@std/expect";
import { stub } from "@std/testing/mock";

type Todo = { userId: number; id: number; title: string; completed: boolean };

Deno.test("Build fetch - Sucessful fetch with async data", async (ctx) => {
  const expectedTodo: Todo = {
    userId: 1,
    id: 1,
    title: "delectus aut autem",
    completed: false,
  };
  using _ = stub(
    globalThis,
    "fetch",
    async () => new Response(JSON.stringify(expectedTodo)),
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
    async () => new Response(null, { status: 404 }),
  );

  const customFetch = buildFetch();
  const response = await customFetch("https://example.com");

  expect(response.ok).toEqual(false);
  await response.body?.cancel();
});
