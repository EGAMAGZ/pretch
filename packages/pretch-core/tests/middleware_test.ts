import { jwtMiddleware } from "@/middleware/jwt.ts";
import { defaultHeadersMiddleware } from "@/middleware/default-headers.ts";
import { validateStatusMiddleware } from "@/middleware/validate-status.ts";
import { expect } from "@std/expect/expect";

Deno.test("Set default headers with set strategy - DefaultHeadersMiddleware", () => {
  const middleware = defaultHeadersMiddleware({
    defaultHeaders: {
      "Content-Type": "application/json",
    },
    strategy: "set",
  });

  const request = new Request("https://jsonplaceholder.typicode.com/users/10", {
    headers: {
      "Content-Type": "text/html",
    },
  });

  middleware(request, (request: Request) => {
    expect(request.headers.get("Content-Type")).toBe("application/json");
    return new Response();
  });
});

Deno.test("Set default headers with append strategy - DefaultHeadersMiddleware", () => {
  const middleware = defaultHeadersMiddleware({
    defaultHeaders: {
      "Content-Type": "application/json",
    },
    strategy: "append",
  });

  const request = new Request("https://jsonplaceholder.typicode.com/users/10");

  middleware(request, (request: Request) => {
    expect(request.headers.get("Content-Type")).toBe("application/json");
    return new Response();
  });
});

Deno.test("Add token to all urls - JwtMiddleware", () => {
  const token = "1234567890";
  const middleware = jwtMiddleware({
    token,
  });

  const request = new Request("https://jsonplaceholder.typicode.com/users/10");

  middleware(request, (request: Request) => {
    expect(request.headers.get("Authorization")).toBe(`Bearer ${token}`);

    return new Response();
  });
});

Deno.test("Add token to urls that starts with '/api/' - JwtMiddleware", () => {
  const token = "1234567890";
  const middleware = jwtMiddleware({
    token,
    shouldApplyToken: (request: Request) =>
      new URL(request.url).pathname.startsWith("/api/"),
  });

  const notApiRequest = new Request(
    "https://jsonplaceholder.typicode.com/users/10",
  );

  middleware(notApiRequest, (request: Request) => {
    expect(request.headers.has("Authorization")).toBe(false);

    return new Response();
  });

  const apiRequest = new Request(
    "https://jsonplaceholder.typicode.com/api/users/10",
  );

  middleware(apiRequest, (request: Request) => {
    expect(request.headers.get("Authorization")).toBe(`Bearer ${token}`);

    return new Response();
  });
});

Deno.test("Valid status to be 200 and 404 - ValidateStatusMiddleware", async (ctx) => {
  const middleware = validateStatusMiddleware({
    validateStatus: (status) => status === 404,
  });

  await ctx.step("Fetch existing user (returns status code 200)", async () => {
    const request = new Request(
      "https://jsonplaceholder.typicode.com/users/10",
    );

    const getUser = () => middleware(request, (r) => fetch(r));
    await expect(getUser()).rejects.toThrow();
  });

  await ctx.step(
    "Fetch not existing user (returns status code 404)",
    async () => {
      const request = new Request(
        "https://jsonplaceholder.typicode.com/users/11",
      );
      const getUser = async () => {
        const response = await middleware(request, (r) => fetch(r));
        await response.body?.cancel();
      };
      await expect(getUser()).resolves.not.toThrow();
    },
  );
});
