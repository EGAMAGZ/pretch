import { buildFetch } from "@/build-fetch.ts";
import { expect } from "@std/expect";

type Todo = { userId: number; id: number; title: string; completed: boolean };

Deno.test("Successful plain fetch - Build fetch", async (ctx) => {
  const customFetch = buildFetch();
  const response = await customFetch(
    "https://jsonplaceholder.typicode.com/todos/1",
  );

  expect(response.ok).toEqual(true);

  await ctx.step("Validate Json response", async () => {
    const body = await response.json() as Todo;

    const expectedTodo: Todo = {
      userId: 1,
      id: 1,
      title: "delectus aut autem",
      completed: false,
    };

    expect(body).toEqual(expectedTodo);
  });
});

Deno.test("Unsuccesful plain fetch - Build fetch", async (ctx) => {
  const customFetch = buildFetch();
  const response = await customFetch(
    "https://jsonplaceholder.typicode.com/todo/1",
  );

  expect(response.ok).toEqual(false);
  await response.body?.cancel();
});
