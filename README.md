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

In the nexts examples, fetch is enhaced with a middleware that will be automatically add default headers to every request

Create a custom fetch with behaviour enhaced through middleware and a base URL

```ts
import pretch from "@pretch/core";
import { applyMiddleware, defaultHeaders} from "@pretch/core/middleware";

const customFetch = pretch(
  "https://jsonplaceholder.typicode.com/todos/",
  applyMiddleware(
    defaultHeaders({
        "Content-Type": "application/json; charset=UTF-8",
      },
      {
      strategy: "append",
    }),
  ),
);

const getResponse = await customFetch.get("/1");

const createdTodo = await getResponse.json();

// The following request will keep the enhanced behaviour of adding default headers
const putResponse = await customFetch.put("/1",{
  body: JSON.stringify({
      title: "Updated todo",
      body: "Same task",
      userId: 1,
    }),
  },
);

const todoUpdated = await putResponse.json();
```

Create a custom fetch with behaviour enhaced through middleware to query different urls

```ts
import pretch from "@pretch/core";
import { applyMiddleware, defaultHeaders} from "@pretch/core/middleware";

const customFetch = pretch(
  applyMiddleware(
    defaultHeaders({
        "Content-Type": "application/json; charset=UTF-8",
      },
     {
      strategy: "append",
    }),
  ),
);

const firstResponse = await customFetch("https://example.com/api/task");

const todo = await firstResponse.json();

const secondResponse = await customFetch("https://otherexample.com/api/auth/sing-in");

const user = await secondResponse.json();
```

## Built-in middlewares

Pretch provides a built-in enhancer to apply middlewares on each request

### Validate Status

```ts
import pretch from "@pretch/core";
import { applyMiddleware, validateStatus } from "@pretch/core/middleware";

const customFetch = pretch(
  applyMiddleware(
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
import pretch from "@pretch/core";
import { applyMiddleware, retry } from "@pretch/core/middleware";

const customFetch = pretch(
  applyMiddleware(
    retry({
      maxRetries: 2,
      delay: 1_500,
    }),
  ),
);
```

### Default Headers

```ts
import pretch from "@pretch/core";
import { applyMiddleware, defaultHeaders } from "@pretch/core/middleware";

const customFetch = pretch(
  applyMiddleware(
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
import pretch from "@pretch/core";
import { applyMiddleware, authorization } from "@pretch/core/middleware";

const customFetch = pretch(
  applyMiddleware(
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
import pretch from "@pretch/core";
import {
  applyMiddleware,
  type ErrorLogData,
  logging,
  type RequestLogData,
  type ResponseLogData,
} from "@pretch/core/middleware";

const customFetch = pretch(
  applyMiddleware(
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
import pretch from "@pretch/core";
import { applyMiddleware, proxy } from "@pretch/core/middleware";

const customFetch = pretch(
  applyMiddleware(
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
  const { data, loading, error, fetchData } = useLazyFetch({
    url: "https://api.example.com/todos/1",
  });

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

### Fetching with `useQuery`

A hook that provides a set of type-safe HTTP method functions (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS) for making requests to a base URL. It includes built-in state management using signals to track loading states and errors.

```tsx
import { useQuery } from "@pretch/react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

function TodoExample() {
  const { get, post } = useQuery<Todo>("https://api.example.com");

  const handleFetch = async () => {
    const { data, loading, error } = await get("/todos/1");
    
    if (error) {
      console.error("Failed to fetch:", error);
      return;
    }
    
    if (data) {
      console.log("Todo:", data.title);
    }
  };

  const handleCreate = async () => {
    const { data, error } = await post("/todos", {
      body: JSON.stringify({
        title: "New Todo",
        completed: false
      })
    });

    if (data) {
      console.log("Created todo:", data);
    }
  };

  return (
    <div>
      <button onClick={handleFetch}>Fetch Todo</button>
      <button onClick={handleCreate}>Create Todo</button>
    </div>
  );
}
```

The hook provides all standard HTTP methods (`get`, `post`, `put`, `patch`, `delete`, `head`, `options`) that return a promise containing:

- `data`: The parsed response data
- `loading`: Boolean indicating if request is in progress
- `error`: Error object if request failed (or null)

Each method supports URL parameters and request options, with full TypeScript support for response types.

### Enhanced the fetching of `useFetch`, `useLazyFetch` and `useQuery`

The hook supports request enhancement through enhancer functions for customizing
request behavior:

**Custom enhancer**: Implement your own enhancer function to modify the request
behavior before it is sent.

```tsx
import type { Enhancer, Handler } from "@pretch/core";
import { useFetch } from "@pretch/react";

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
  applyMiddleware,
  authorization,
  defaultHeaders,
  retry,
} from "@pretch/core";

import { useFetch, useLazyFetch, useQuery } from "@precth/react";

function TodoList() {
  const { data, loading, error, refetch } = useFetch(
    "https://api.example.com/todos/",
    {
      enhancer: applyMiddleware(
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
  const {data, fetchData, error, loading} = useLazyFetch({
    url: "https://api.example.com/todos/",
    enhancer: applyMiddleware(
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

- [x] Create useQuery hook inspired on @tanstack/react-query and redux query
- [] Develop and automatize tests for @pretch/preact and @pretch/react
