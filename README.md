# Pretch

<div align="center">
  <a href="https://jsr.io/@pretch">
    <img src="./docs/images/logo.png" width="200" height="auto" alt="Hono"/>
  </a>
</div>

A lightweight and flexible fetch enhancement library that works with vanilla
JavaScript, React, and Preact.

[![JSR Scope](https://jsr.io/badges/@pretch)](https://jsr.io/@pretch)
![GitHub License](https://img.shields.io/github/license/egamagz/pretch)
![GitHub Release](https://img.shields.io/github/v/release/egamagz/pretch)

Check the [Documentation](https://jsr.io/@pretch) in JSR

## Features

- 🌐 Universal Compatibility – Seamlessly runs in all JavaScript environments,
  including Node.js, Bun, Deno, and browsers.
- ⚛️ Tailored for React & Preact – Enjoy dedicated hooks with full-feature
  integration for both frameworks.
- 🔧 Endlessly Customizable – Design custom fetch functions tailored to your
  unique requirements.
- 📝 TypeScript Native – Built-in TypeScript support ensures a flawless
  developer experience.
- 🛠 Powerful Middleware System – Leverage built-in middleware or create your own
  for extended functionality.
- 📦 Web API Driven – Crafted with a focus on modern Web APIs for seamless
  integration.

## Packages

- `@pretch/core` - Core functionality and middleware system
- `@pretch/react` - React hooks integration
- `@pretch/preact` - Preact hooks integration

## Usage

### Core (Vanilla Javascript) - @pretch/core

```typescript
import { buildFetch } from "@pretch/core";
import { applyMiddlewares, defaultHeaders } from "@pretch/core/middleware";

const customFetch = buildFetch(
  applyMiddlewares(
    defaultHeaders({
      "Content-Type": "application/json; charset=UTF-8",
    }),
  ),
);
// Use your enhanced fetch
const response = await customFetch("https://api.example.com/todos/1");
const data = await response.json();
```

## Built-in middlewares

Pretch provides a built-in enhancer to apply middlewares on each request

### Validate Status

```ts
import { buildFetch } from "@pretch/core";
import { applyMiddlewares, validateStatus } from "@pretch/core/middleware";

const customFetch = buildFetch(
  applyMiddlewares(
    validateStatus({
      validate: (status) => 200 <= status && status <= 399,
      errorFactory: (status, request, response) =>
        new Error(`Error. Status code: ${status}`),
      shouldCancelBody: true,
    }),
  ),
);
```

### Retry

```ts
import { buildFetch } from "@pretch/core";
import { applyMiddlewares, retry } from "@pretch/core/middleware";

const customFetch = buildFetch(
  applyMiddlewares(
    retry({
      maxRetries: 2,
      delay: 1_500,
    }),
  ),
);
```

### Default Headers

```ts
import { buildFetch } from "@pretch/core";
import { applyMiddlewares, defaultHeaders } from "@pretch/core/middleware";

const customFetch = buildFetch(
  applyMiddlewares(
    defaultHeaders({
      "Content-Type": "application/json; charset=UTF-8",
    }, {
      strategy: "set", // Optional, by default the headers appended
    }),
  ),
);
```

### Authorization

```ts
import { buildFetch } from "@pretch/core";
import { applyMiddlewares, authorization } from "@pretch/core/middleware";

const customFetch = buildFetch(
  applyMiddlewares(
    authorization(
      "123456789abcdef",
      "bearer",
      {
        shouldApplyToken: (request: Request) =>
          new URL(request.url).pathname.startsWith("/api/"),
      },
    ),
  ),
);
```

### Logging

```ts
import { buildFetch } from "@pretch/core";
import {
  applyMiddlewares,
  type ErrorLogData,
  logging,
  type RequestLogData,
  type ResponseLogData,
} from "@pretch/core/middleware";

const customFetch = buildFetch(
  applyMiddlewares(
    logging({
      onRequest: async ({ request }: RequestLogData) => {
        console.log(`Starting request to ${request.url}`);
      },
      onResponse: async ({ response }: ResponseLogData) => {
        console.log(`Received response with status ${response.status}`);
      },
      onCatch: async ({ error }: ErrorLogData) => {
        console.error(`Request failed:`, error);
      },
    }),
  ),
);
```

### Proxy

```ts
import { buildFetch } from "@pretch/core";
import { applyMiddlewares, proxy } from "@pretch/core/middleware";

const customFetch = buildFetch(
  applyMiddlewares(
    proxy(
      "/api", // Forward all requests starting with /api
      "https://api.example.com",
      {
        pathRewrite: (path: string) => path.replace(/^\/api/, ""), // Remove /api prefix
      },
    ),
  ),
);
```

## React integration(@pretch/react) and Preact integration(@pretch/preact)

The React and Preact integration delivers powerful hooks for both automatic and
manual fetching, complete with built-in state management. Both packages share a
unified API and identical features, with the only difference being the package
source for importing the hooks.

Key Features of the Hooks:

- 🔄 Loading & Error State Management – Effortlessly track request states with
  built-in tools.
- 🛡 Type-Safe Response Handling – Enjoy confidence in your data with robust
  TypeScript support.
- ⚙️ Request Enhancement – Easily customize and optimize fetch requests to meet
  your needs.
- 🛠 Seamless @pretch/core Integration – Fully compatible with middlewares,
  enhancers, and other advanced features provided by the @pretch/core package.

### Fetching with `useFetch`

`useFetch` automatically fetches the data when the component mounts. You can
refetch the data when the `refetch` function is called.

```tsx
import { useFetch } from "@pretch/react";

function MyComponent() {
  const { data, loading, error, refetch } = useFetch(
    "https://api.example.com/todos/1",
  );

  const handleClick = () => {
    refetch();
  };

  return (
    <div>
      {loading ? "Loading..." : "Data: " + JSON.stringify(data)}
      {error && <p>Error: {error.message}</p>}
      <button onClick={handleClick} disabled={loading}>Refresh</button>
    </div>
  );
}
```

### Fetching with `useLazyFetch`

`useLazyFetch` fetches the data manually. You can trigger the fetch with the
`fetchData` function.

```tsx
import { useLazyFetch } from "@pretch/react";

function MyComponent() {
  const { data, loading, error, fetchData } = useLazyFetch(
    "https://api.example.com/todos/1",
  );
  const handleClick = () => {
    fetchData({
      newOptions: {
        method: "POST",
        body: JSON.stringify({ title: "New Todo" }),
      },
    });
  };

  return (
    <div>
      {loading ? "Loading..." : "Data: " + JSON.stringify(data)}
      {error && <p>Error: {error.message}</p>}
      <button onClick={handleClick}>Create Todo</button>
    </div>
  );
}
```

### Enhanced the fetching of `useFetch` and `useLazyFetch`

The hook supports request enhancement through enhancer functions for customizing
request behavior:

**Custom enhancer**: Implement your own enhancer function to modify the request
behavior before it is sent.

```tsx
import type { Enhancer, Handler } from "@pretch/core";

function authHeaderEnhancer(handler: Handler) {
  return async (request: Request) => {
    const modifiedRequest = new Request(request, {
      headers: {
        ...request.headers,
        "Authorization": "Bearer my-token",
      },
    });

    return handler(modifiedRequest);
  };
}

function MyComponent() {
  const { data } = useFetch("https://example.com", {
    enhancer: authHeaderEnhancer,
  });

  return (
    <div>
      Data: {JSON.stringify(data)}
    </div>
  );
}
```

**Built-in middlewares**: Otherwise, Pretch provides a built-in enhancer to
apply middlewares on each request, including built-in middlewares.

```tsx
import {
  applyMiddlewares,
  authorization,
  defaultHeaders,
  retry,
} from "@pretch/core";

import { useFetch, useLazyFetch } from "@precth/react";

function TodoList() {
  const { data, loading, error, refetch } = useFetch(
    "https://api.example.com/todos/",
    {
      enhancer: applyMiddlewares(
        retry({
          maxRetries: 2,
          delay: 500,
        }),
        authorization("your-token", "bearer"),
      ),
    },
  );

  const handleClick = () => { refetch() };

  return (
    <div>
      {loading ? <span>Loading...</span> : (
        <ul>
          {data.map((todo) => {
            <li>{todo.title}</li>;
          })}
        </ul>
      )}
      {error && <p>Error: {error.message}</p>}
      <button onClick={handleClick}>Refresh</button>
    </div>
  );
}

function CreateTodo() {
  const {data, fetchData, error, loading} = useLazyFetch("https://api.example.com/todos/", {
    enhancer: applyMiddlewares(
      defaultHeaders({
        "Content-Type": "application/json; charset=UTF-8",
      }),
    ),
  });

  const handleSubmit = async (event: SubmitEvent ) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);

    fetchData({
      newOptions: {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      }
    })
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" >
      <button>Create</button>
    </form>
  );
}
```

## Why Pretch?

Struggling to find a simple yet customizable fetching hook library for Preact, I
created @pretch/preact, focusing on ease of use, minimal abstraction, and
alignment with Web APIs. This evolved into @pretch/core, a versatile package for
fetch customization with built-in middlewares and enhancers, later extended to
@pretch/react and @pretch/preact for React and Preact integration.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

Created by [EGAMAGZ](https://github.com/EGAMAGZ)

## License

MIT License

## TODO

- Create useQuery hook inspired on @tanstack/react-query and redux query
- Develop and automatize tests for @pretch/preact and @pretch/react
