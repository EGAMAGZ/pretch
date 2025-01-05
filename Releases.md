### 2025.01.05

#### @pretch/core 0.5.6 (patch)

- BREAKING(core): Allow build url based custom fetch or not
- docs(core): Added missing usage example of proxy middleware in mod.ts

#### @pretch/preact 0.1.9 (patch)

- docs(react,preact): Updated JSDoc to match with pretch/core exports

#### @pretch/react 0.0.8 (patch)

- docs(react,preact): Updated JSDoc to match with pretch/core exports

### 2024.12.26

#### @pretch/core 0.5.6 (patch)

- docs(core): Added missing usage example of proxy middleware in mod.ts

### 2024.12.26

#### @pretch/core 0.5.5 (patch)

- feat(core): Created new middleware, proxy middleware, and updated README
- feat(core): Added feature to whether apply default headers based on
  conditional
- docs(core): Improve JSDoc description of authorization middleware's parameters
- docs(core): Added example of loggin middleware to showcase usage
- style(core): Formatted code
- refactor(core): Created loggin middleware
- test(core): Created test for proxy middleware

#### @pretch/preact 0.1.8 (patch)

- refactor(react,preact): Made url parameter optional for useLazyFetch hook

#### @pretch/react 0.0.7 (patch)

- refactor(react,preact): Made url parameter optional for useLazyFetch hook

### 2024.11.28

#### @pretch/preact 0.1.7 (patch)

- fix(preact,react): Fixed typing error to indicate with functions returns a
  promise

#### @pretch/react 0.0.6 (patch)

- fix(preact,react): Fixed typing error to indicate with functions returns a
  promise

### 2024.11.28

#### @pretch/core 0.5.4 (patch)

- docs(core): Improved JSDoc for middleware's mod.ts

#### @pretch/preact 0.1.6 (patch)

- docs(preact): Modified JSdoc to provide more examples of useLazyFetch hook
  usage
- docs(preact): Modified JSdoc to provide more examples of its usage
- refactor(preact): Changed options in useLazyFetch hook to follow deno's code
  style in case of optional parameters
- refactor(preact): Changed options in useFetch hook to follow deno's code style
  in case of optional parameters
- chore(preact): Removed useless task defined to generate doc manually

#### @pretch/react 0.0.5 (patch)

- docs(react): Modified JSDoc of both hooks to provide usage examples
- refactor(react): Changed options in useLazyFetch and useFetch hooks to follow
  deno's code style in case of optional parameters

### 2024.11.19

#### @pretch/core 0.5.3 (patch)

- docs(core): Wrote a description for middleware module

#### @pretch/preact 0.1.5 (patch)

- fix(preact,react): Exported missing hooks in both packages (useLazyFetch)
- docs(preact/unstable): Wrote template for useFetch's JSDoc
- refactor(preact,react): Added missing parameter in both FetchResult type

#### @pretch/react 0.0.4 (patch)

- fix(preact,react): Exported missing hooks in both packages (useLazyFetch)
- refactor(preact,react): Added missing parameter in both FetchResult type

### 2024.11.18

#### @pretch/core 0.5.2 (minor)

- docs(core): Improved jsdoc for buildFetch function
- style(core): Formatted project
- style(core): Formatted files
- style(core): Added return type in function that misses it and formatted code
- refactor(core): Updated validate status middleware to set a default validation
  of status
- refactor(core): Added flags to indicate when the fetch will be retried
- refactor(core): Turned jwt middleware to authorization middleware to support
  different authorizations schemes
- refactor(core): Renamed middlewares to remove unnecessary "middleware" name
- refactor(core,preact): Moved FetchResult type from core to preact workspace
  and added usage example of ValidateStatusMiddleware
- refactor(core): Refactored code to follow deno style guide and added feature
  to dump body on invalid status (before throwing exception)
- refactor(core): Distributed test through different files and renamed existing
  ones to follo the deno naming conventions
- refactor(core): Validate delay and max number of retries in
- refactor(core): Updated export path of build fetch function
- refactor(core): Renamed function from apply-middleware to apply-middlewares
- refactor(core): Removed useless "retry" function
- test(core): Created missing test for retry middleware and improved description
  and mocking of the rest of tests
- test(core): Developed tests the new features of retry middleware
- test(core): Tested maxRetries and delay validation
- test(core): Improved tests
- test(core): Developed test for buildFetch with middlewares applied
- test(core): Changed tests description to be more understandable
- test(core): Usage of stub in build fetch's tests
- test(core): Modified test data to not depend on external api's for testing and
  get more control
- test(core): Created and passed test for RetryMiddleware
- test(core): Created and passed test for ValidateStatusMiddleware

#### @pretch/preact 0.1.4 (patch)

- fix(preact,react): Exported missing hooks
- docs(preact): Improved JSDoc for useFetch hook
- refactor(preact): Created useLazyFetch hook
- refactor(preact): Renamed file into use_fetch.ts
- refactor(core,preact): Moved FetchResult type from core to preact workspace
  and added usage example of ValidateStatusMiddleware
- chore(preact): Fixed typo in workspace name

#### @pretch/react 0.0.3 (patch)

- feat(react): Created same hooks from preact version
- fix(preact,react): Exported missing hooks

### 2024.11.11

#### @pretch/core 0.5.2 (minor)

- docs(core): Improved jsdoc for buildFetch function
- style(core): Formatted project
- style(core): Formatted files
- style(core): Added return type in function that misses it and formatted code
- refactor(core): Turned jwt middleware to authorization middleware to support
  different authorizations schemes
- refactor(core): Renamed middlewares to remove unnecessary "middleware" name
- refactor(core,preact): Moved FetchResult type from core to preact workspace
  and added usage example of ValidateStatusMiddleware
- refactor(core): Refactored code to follow deno style guide and added feature
  to dump body on invalid status (before throwing exception)
- refactor(core): Distributed test through different files and renamed existing
  ones to follo the deno naming conventions
- refactor(core): Validate delay and max number of retries in
- refactor(core): Updated export path of build fetch function
- refactor(core): Renamed function from apply-middleware to apply-middlewares
- refactor(core): Removed useless "retry" function
- test(core): Tested maxRetries and delay validation
- test(core): Improved tests
- test(core): Developed test for buildFetch with middlewares applied
- test(core): Changed tests description to be more understandable
- test(core): Usage of stub in build fetch's tests
- test(core): Modified test data to not depend on external api's for testing and
  get more control
- test(core): Created and passed test for RetryMiddleware
- test(core): Created and passed test for ValidateStatusMiddleware

#### @pretch/preact 0.1.4 (patch)

- docs(preact): Improved JSDoc for useFetch hook
- refactor(preact): Created useLazyFetch hook
- refactor(preact): Renamed file into use_fetch.ts
- refactor(core,preact): Moved FetchResult type from core to preact workspace
  and added usage example of ValidateStatusMiddleware
- chore(preact): Fixed typo in workspace name

#### @pretch/react 0.0.3 (patch)

- feat(react): Created same hooks from preact version

### 2024.11.11

#### @pretch/core 0.5.2 (minor)

- docs(core): Improved jsdoc for buildFetch function
- style(core): Formatted project
- style(core): Formatted files
- style(core): Added return type in function that misses it and formatted code
- refactor(core): Turned jwt middleware to authorization middleware to support
  different authorizations schemes
- refactor(core): Renamed middlewares to remove unnecessary "middleware" name
- refactor(core,preact): Moved FetchResult type from core to preact workspace
  and added usage example of ValidateStatusMiddleware
- refactor(core): Refactored code to follow deno style guide and added feature
  to dump body on invalid status (before throwing exception)
- refactor(core): Distributed test through different files and renamed existing
  ones to follo the deno naming conventions
- refactor(core): Validate delay and max number of retries in
- refactor(core): Updated export path of build fetch function
- refactor(core): Renamed function from apply-middleware to apply-middlewares
- refactor(core): Removed useless "retry" function
- test(core): Tested maxRetries and delay validation
- test(core): Improved tests
- test(core): Developed test for buildFetch with middlewares applied
- test(core): Changed tests description to be more understandable
- test(core): Usage of stub in build fetch's tests
- test(core): Modified test data to not depend on external api's for testing and
  get more control
- test(core): Created and passed test for RetryMiddleware
- test(core): Created and passed test for ValidateStatusMiddleware

#### @pretch/preact 0.1.4 (patch)

- docs(preact): Improved JSDoc for useFetch hook
- refactor(preact): Created useLazyFetch hook
- refactor(preact): Renamed file into use_fetch.ts
- refactor(core,preact): Moved FetchResult type from core to preact workspace
  and added usage example of ValidateStatusMiddleware
- chore(preact): Fixed typo in workspace name

#### @pretch/react 0.0.3 (patch)

- feat(react): Created same hooks from preact version

### 2024.11.03

#### @pretch/core 0.5.2 (patch)

- chore(*): Added license to each workspace

#### @pretch/preact 0.1.4 (patch)

- chore(*): Added license to each workspace

#### @pretch/react 0.0.3 (patch)

- chore(*): Added license to each workspace

### 2024.11.03

#### @pretch/core 0.5.1 (minor)

- docs(core): Improved jsdoc for buildFetch function
- style(core): Formatted project
- style(core): Formatted files
- style(core): Added return type in function that misses it and formatted code
- refactor(core): Turned jwt middleware to authorization middleware to support
  different authorizations schemes
- refactor(core): Renamed middlewares to remove unnecessary "middleware" name
- refactor(core,preact): Moved FetchResult type from core to preact workspace
  and added usage example of ValidateStatusMiddleware
- refactor(core): Refactored code to follow deno style guide and added feature
  to dump body on invalid status (before throwing exception)
- refactor(core): Distributed test through different files and renamed existing
  ones to follo the deno naming conventions
- refactor(core): Validate delay and max number of retries in
- refactor(core): Updated export path of build fetch function
- refactor(core): Renamed function from apply-middleware to apply-middlewares
- refactor(core): Removed useless "retry" function
- test(core): Tested maxRetries and delay validation
- test(core): Improved tests
- test(core): Developed test for buildFetch with middlewares applied
- test(core): Changed tests description to be more understandable
- test(core): Usage of stub in build fetch's tests
- test(core): Modified test data to not depend on external api's for testing and
  get more control
- test(core): Created and passed test for RetryMiddleware
- test(core): Created and passed test for ValidateStatusMiddleware

#### @pretch/preact 0.1.3 (patch)

- refactor(core,preact): Moved FetchResult type from core to preact workspace
  and added usage example of ValidateStatusMiddleware
- chore(preact): Fixed typo in workspace name

#### @pretch/react 0.0.2 (patch)

- style(*): Formatted project
- chore(*): Moved compilerOptions to root deno.json
