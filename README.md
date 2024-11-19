# Pretch

A lightweight and flexible fetch enhancement library that works with vanilla JavaScript, React, and Preact.

## Features

- 🌐 **Universal Compatibility** - Works in all JavaScript runtimes (Node.js, Bun, Deno) and browsers
- 🛠 **Middleware System** - Built-in and custom middleware enhancer
- ⚛️ **Framework Integration** - Dedicated hooks for React and Preact
- 🔧 **Highly Customizable** - Create custom fetch functions with enhanced behavior
- 📝 **TypeScript Ready** - Full TypeScript support out of the box

## Packages

- `@pretch/core` - Core functionality and middleware system
- `@pretch/react` - React hooks integration
- `@pretch/preact` - Preact hooks integration

## Usage

### Core (@pretch/core)

```typescript
import { buildFetch } from "@pretch/core";
import { applyMiddlewares, defaultHeaders } from "@pretch/core/middleware";

const customFetch = buildFetch(
    applyMiddlewares(
        defaultHeaders({
            "Content-Type": "application/json; charset=UTF-8",
        })
    )
);
// Use your enhanced fetch
const response = await customFetch("https://api.example.com/todos/1");
const data = await response.json()
```

## Built-in middlewares

Pretch provides a built-in enhancer to apply middlewares on each request

### Validate Status

```ts
import { buildFetch } from "@pretch/core";
import { applyMiddlewares, validateStatus} from "@pretch/core/middleware";

const customFetch = buildFetch(
    applyMiddlewares(
        validateStatus({
            validate:(status) => 200 <= status && status <= 399,
            errorFactory: (status, request, response) => new Error(`Error. Status code: ${status}`),
            shouldCancelBody: true
        }),
    )
);
```

### Retry

```ts
import { buildFetch } from "@pretch/core";
import { applyMiddlewares, retry} from "@pretch/core/middleware";

const customFetch = buildFetch(
    applyMiddlewares(
        retry({
            maxRetries: 2,
            delay: 1_500,
        }),
    )
);
```

### Default Headers

```ts
import { buildFetch } from "@pretch/core";
import { applyMiddlewares, defaultHeaders} from "@pretch/core/middleware";

const customFetch = buildFetch(
    applyMiddlewares(
        defaultHeaders({
                "Content-Type": "application/json; charset=UTF-8"
            },
            {
            strategy: "set", // Optional, by default the headers appended
        }),
    )
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
    )
);
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

Created by [EGAMAGZ](https://github.com/EGAMAGZ )

## License

MIT License

## TODO

- Develop and automatize tests for @pretch/preact and @pretch/react
