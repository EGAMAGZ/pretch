import { expect } from "@std/expect/expect";
import { assertSpyCalls, spy, stub } from "@std/testing/mock";
import {
  type ErrorLogData,
  logging,
  type RequestLogData,
  type ResponseLogData,
} from "@/middleware/logging.ts";

Deno.test("Logging middleware - should handle successful requests with static handlers", async () => {
  let capturedResponse: Response | null = null;

  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async (_input, _init) => {
      capturedResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      return capturedResponse;
    },
  );

  const onRequestSpy = spy((data: RequestLogData) => {
    expect(data.request.url).toEqual("https://example.com/");
    expect(data.request.method).toEqual("GET");
  });

  const onResponseSpy = spy((data: ResponseLogData) => {
    expect(data.response.status).toEqual(200);
    expect(data.response.headers.get("Content-Type")).toEqual(
      "application/json",
    );
  });

  const onCatchSpy = spy(() => {});

  const middleware = logging({
    onRequest: onRequestSpy,
    onResponse: onResponseSpy,
    onCatch: onCatchSpy,
  });

  const request = new Request("https://example.com");
  const response = await middleware(request, fetch);

  expect(await response.json()).toEqual({ success: true });
  assertSpyCalls(onRequestSpy, 1);
  assertSpyCalls(onResponseSpy, 1);
  assertSpyCalls(onCatchSpy, 0);
});

Deno.test("Logging middleware - should handle failed requests with static handlers", async () => {
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async () => {
      throw new Error("Network error");
    },
  );

  const onRequestSpy = spy(() => {});
  const onResponseSpy = spy(() => {});
  const onCatchSpy = spy((data: ErrorLogData) => {
    expect(data.error.message).toEqual("Network error");
  });

  const middleware = logging({
    onRequest: onRequestSpy,
    onResponse: onResponseSpy,
    onCatch: onCatchSpy,
  });

  const request = new Request("https://example.com");

  await expect(middleware(request, fetch)).rejects.toThrow("Network error");
  assertSpyCalls(onRequestSpy, 1);
  assertSpyCalls(onResponseSpy, 0);
  assertSpyCalls(onCatchSpy, 1);
});

Deno.test("Logging middleware - should handle requests with factory handlers", async () => {
  let capturedResponse: Response | null = null;

  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async () => {
      capturedResponse = new Response(null, { status: 200 });
      return capturedResponse;
    },
  );

  const onRequestSpy = spy(() => {});
  const onResponseSpy = spy(() => {});
  const onCatchSpy = spy(() => {});

  const middleware = logging(() => ({
    onRequest: onRequestSpy,
    onResponse: onResponseSpy,
    onCatch: onCatchSpy,
  }));

  const request = new Request("https://example.com");
  await middleware(request, fetch);

  assertSpyCalls(onRequestSpy, 1);
  assertSpyCalls(onResponseSpy, 1);
  assertSpyCalls(onCatchSpy, 0);
});

Deno.test("Logging middleware - should work with partial handlers", async () => {
  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async () => new Response(null, { status: 200 }),
  );

  const onRequestSpy = spy(() => {});

  const middleware = logging({
    onRequest: onRequestSpy,
  });

  const request = new Request("https://example.com");
  await middleware(request, fetch);

  assertSpyCalls(onRequestSpy, 1);
});

Deno.test("Logging middleware - should preserve request/response chain", async () => {
  const responseBody = JSON.stringify({ data: "test" });
  const responseHeaders = new Headers({ "Content-Type": "application/json" });

  using _ = stub(
    globalThis,
    "fetch",
    // deno-lint-ignore require-await
    async () =>
      new Response(responseBody, {
        status: 200,
        headers: responseHeaders,
      }),
  );

  const middleware = logging({});

  const request = new Request("https://example.com");
  const response = await middleware(request, fetch);

  expect(await response.json()).toEqual({ data: "test" });
  expect(response.headers.get("Content-Type")).toEqual("application/json");
});
